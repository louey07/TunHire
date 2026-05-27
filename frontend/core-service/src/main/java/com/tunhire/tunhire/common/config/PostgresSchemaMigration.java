package com.tunhire.tunhire.common.config;

import javax.sql.DataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class PostgresSchemaMigration implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(PostgresSchemaMigration.class);

    private final JdbcTemplate jdbcTemplate;
    private final DataSource dataSource;

    public PostgresSchemaMigration(JdbcTemplate jdbcTemplate, DataSource dataSource) {
        this.jdbcTemplate = jdbcTemplate;
        this.dataSource = dataSource;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        if (!isPostgreSQL()) {
            return;
        }

        migrateCompanyMembershipRoles();
        migrateJobStatuses();
        migrateJobWorkMode();
        migrateChatUniqueness();
    }

    private void migrateCompanyMembershipRoles() {
        if (!tableExists("company_memberships")) {
            return;
        }

        jdbcTemplate.update(
            "UPDATE company_memberships SET role = 'RECRUITER_ADMIN' WHERE role IN ('OWNER', 'ADMIN')"
        );

        jdbcTemplate.execute(
            "ALTER TABLE company_memberships DROP CONSTRAINT IF EXISTS company_memberships_role_check"
        );
        jdbcTemplate.execute(
            """
            ALTER TABLE company_memberships
            ADD CONSTRAINT company_memberships_role_check
            CHECK (role IN ('RECRUITER_ADMIN', 'MEMBER'))
            """
        );

        log.info("Updated company_memberships role check constraint");
    }

    private void migrateJobStatuses() {
        if (!tableExists("jobs")) {
            return;
        }

        jdbcTemplate.update(
            "UPDATE jobs SET status = 'OPEN' WHERE status IN ('ACTIVE', 'PUBLISHED', 'LIVE')"
        );
        jdbcTemplate.update(
            "UPDATE jobs SET status = 'CLOSED' WHERE status IN ('INACTIVE', 'ARCHIVED')"
        );
        jdbcTemplate.update(
            """
            UPDATE jobs
            SET status = 'DRAFT'
            WHERE status IS NULL OR status NOT IN ('DRAFT', 'OPEN', 'CLOSED')
            """
        );

        jdbcTemplate.execute("ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_status_check");
        jdbcTemplate.execute(
            """
            ALTER TABLE jobs
            ADD CONSTRAINT jobs_status_check
            CHECK (status IN ('DRAFT', 'OPEN', 'CLOSED'))
            """
        );

        log.info("Updated jobs status check constraint");
    }

    private void migrateJobWorkMode() {
        if (!tableExists("jobs")) {
            return;
        }

        if (!columnExists("jobs", "work_mode")) {
            jdbcTemplate.execute(
                "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS work_mode VARCHAR(255)"
            );
        }

        jdbcTemplate.update(
            "UPDATE jobs SET work_mode = 'ON_SITE' WHERE work_mode IS NULL"
        );

        jdbcTemplate.execute("ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_work_mode_check");
        jdbcTemplate.execute(
            """
            ALTER TABLE jobs
            ADD CONSTRAINT jobs_work_mode_check
            CHECK (work_mode IN ('ON_SITE', 'HYBRID', 'REMOTE'))
            """
        );

        log.info("Updated jobs work_mode check constraint");
    }

    private void migrateChatUniqueness() {
        if (!tableExists("chat_conversations")) {
            return;
        }

        dedupeDirectConversations();
        dedupeCompanyTeamConversations();
        if (tableExists("chat_participants")) {
            dedupeChatParticipants();
        }

        jdbcTemplate.execute(
            """
            CREATE UNIQUE INDEX IF NOT EXISTS uq_chat_conversations_company
            ON chat_conversations (type, company_id)
            WHERE type = 'COMPANY_TEAM' AND company_id IS NOT NULL
            """
        );
        jdbcTemplate.execute(
            """
            CREATE UNIQUE INDEX IF NOT EXISTS uq_chat_conversations_direct
            ON chat_conversations (type, direct_user_low_id, direct_user_high_id)
            WHERE type = 'DIRECT'
            """
        );
        if (tableExists("chat_participants")) {
            jdbcTemplate.execute(
                """
                CREATE UNIQUE INDEX IF NOT EXISTS uq_chat_participants_conversation_user
                ON chat_participants (conversation_id, user_id)
                """
            );
        }

        log.info("Applied chat uniqueness indexes and deduplication");
    }

    private void dedupeDirectConversations() {
        if (!tableExists("chat_messages") || !tableExists("chat_participants")) {
            return;
        }

        jdbcTemplate.update(
            """
            UPDATE chat_messages m
            SET conversation_id = ranked.kept_id
            FROM (
                SELECT id,
                       MIN(id) OVER (
                           PARTITION BY type, direct_user_low_id, direct_user_high_id
                       ) AS kept_id
                FROM chat_conversations
                WHERE type = 'DIRECT'
            ) ranked
            WHERE m.conversation_id = ranked.id
              AND ranked.id <> ranked.kept_id
            """
        );

        jdbcTemplate.update(
            """
            DELETE FROM chat_participants p
            USING (
                SELECT p2.id
                FROM chat_participants p2
                JOIN (
                    SELECT id,
                           MIN(id) OVER (
                               PARTITION BY type, direct_user_low_id, direct_user_high_id
                           ) AS kept_id
                    FROM chat_conversations
                    WHERE type = 'DIRECT'
                ) ranked ON p2.conversation_id = ranked.id
                JOIN chat_participants keeper
                  ON keeper.conversation_id = ranked.kept_id
                 AND keeper.user_id = p2.user_id
                WHERE ranked.id <> ranked.kept_id
            ) duplicates
            WHERE p.id = duplicates.id
            """
        );

        jdbcTemplate.update(
            """
            UPDATE chat_participants p
            SET conversation_id = ranked.kept_id
            FROM (
                SELECT id,
                       MIN(id) OVER (
                           PARTITION BY type, direct_user_low_id, direct_user_high_id
                       ) AS kept_id
                FROM chat_conversations
                WHERE type = 'DIRECT'
            ) ranked
            WHERE p.conversation_id = ranked.id
              AND ranked.id <> ranked.kept_id
            """
        );

        jdbcTemplate.update(
            """
            DELETE FROM chat_conversations c
            USING (
                SELECT id
                FROM (
                    SELECT id,
                           MIN(id) OVER (
                               PARTITION BY type, direct_user_low_id, direct_user_high_id
                           ) AS kept_id
                    FROM chat_conversations
                    WHERE type = 'DIRECT'
                ) ranked
                WHERE id <> kept_id
            ) duplicates
            WHERE c.id = duplicates.id
            """
        );
    }

    private void dedupeCompanyTeamConversations() {
        if (!tableExists("chat_messages") || !tableExists("chat_participants")) {
            return;
        }

        jdbcTemplate.update(
            """
            UPDATE chat_messages m
            SET conversation_id = ranked.kept_id
            FROM (
                SELECT id,
                       MIN(id) OVER (PARTITION BY type, company_id) AS kept_id
                FROM chat_conversations
                WHERE type = 'COMPANY_TEAM'
            ) ranked
            WHERE m.conversation_id = ranked.id
              AND ranked.id <> ranked.kept_id
            """
        );

        jdbcTemplate.update(
            """
            DELETE FROM chat_participants p
            USING (
                SELECT p2.id
                FROM chat_participants p2
                JOIN (
                    SELECT id,
                           MIN(id) OVER (PARTITION BY type, company_id) AS kept_id
                    FROM chat_conversations
                    WHERE type = 'COMPANY_TEAM'
                ) ranked ON p2.conversation_id = ranked.id
                JOIN chat_participants keeper
                  ON keeper.conversation_id = ranked.kept_id
                 AND keeper.user_id = p2.user_id
                WHERE ranked.id <> ranked.kept_id
            ) duplicates
            WHERE p.id = duplicates.id
            """
        );

        jdbcTemplate.update(
            """
            UPDATE chat_participants p
            SET conversation_id = ranked.kept_id
            FROM (
                SELECT id,
                       MIN(id) OVER (PARTITION BY type, company_id) AS kept_id
                FROM chat_conversations
                WHERE type = 'COMPANY_TEAM'
            ) ranked
            WHERE p.conversation_id = ranked.id
              AND ranked.id <> ranked.kept_id
            """
        );

        jdbcTemplate.update(
            """
            DELETE FROM chat_conversations c
            USING (
                SELECT id
                FROM (
                    SELECT id,
                           MIN(id) OVER (PARTITION BY type, company_id) AS kept_id
                    FROM chat_conversations
                    WHERE type = 'COMPANY_TEAM'
                ) ranked
                WHERE id <> kept_id
            ) duplicates
            WHERE c.id = duplicates.id
            """
        );
    }

    private void dedupeChatParticipants() {
        jdbcTemplate.update(
            """
            DELETE FROM chat_participants p
            USING chat_participants p2
            WHERE p.conversation_id = p2.conversation_id
              AND p.user_id = p2.user_id
              AND p.id > p2.id
            """
        );
    }

    private boolean columnExists(String tableName, String columnName) {
        Integer count = jdbcTemplate.queryForObject(
            """
            SELECT COUNT(*)
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = ? AND column_name = ?
            """,
            Integer.class,
            tableName,
            columnName
        );
        return count != null && count > 0;
    }

    private boolean tableExists(String tableName) {
        Integer count = jdbcTemplate.queryForObject(
            """
            SELECT COUNT(*)
            FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = ?
            """,
            Integer.class,
            tableName
        );
        return count != null && count > 0;
    }

    private boolean isPostgreSQL() throws Exception {
        try (var connection = dataSource.getConnection()) {
            return "PostgreSQL".equalsIgnoreCase(connection.getMetaData().getDatabaseProductName());
        }
    }
}
