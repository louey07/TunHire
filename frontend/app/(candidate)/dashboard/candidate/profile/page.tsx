"use client";

import CandidateContent from "@/components/CandidateContent";
import CvUploadSection from "@/components/candidate/CvUploadSection";
import ProfileForm from "@/components/candidate/ProfileForm";
import ProfileHero from "@/components/candidate/ProfileHero";
import SkillsSection from "@/components/candidate/SkillsSection";
import { useCandidateProfile } from "@/lib/hooks/useCandidateProfile";

export default function CandidateProfilePage() {
  const {
    profile,
    firstName,
    lastName,
    loading,
    cvLoaded,
    cvFileName,
    editMode,
    setEditMode,
    editForm,
    setEditForm,
    savingProfile,
    profileMsg,
    setProfileMsg,
    saveProfile,
    newSkill,
    setNewSkill,
    addingSkill,
    skillMsg,
    addSkills,
    deleteSkill,
    cvParsing,
    cvMsg,
    handleCVFile,
    skills,
    profileScore,
  } = useCandidateProfile();

  const experienceLabel = profile?.yearsOfExperience
    ? `${profile.yearsOfExperience} ans`
    : "—";

  return (
    <CandidateContent>
      <div className="space-y-8">
        <ProfileHero
          firstName={firstName}
          lastName={lastName}
          profileScore={profileScore}
          skillsCount={skills.length}
          experienceLabel={experienceLabel}
        />

        {loading ? (
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-8">
              <div className="surface-card h-40 animate-pulse rounded-3xl" />
              <div className="surface-card h-56 animate-pulse rounded-3xl" />
            </div>
            <div className="lg:col-span-4">
              <div className="surface-card h-52 animate-pulse rounded-3xl" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="space-y-8 lg:col-span-8">
              <ProfileForm
                profile={profile}
                firstName={firstName}
                lastName={lastName}
                editMode={editMode}
                setEditMode={setEditMode}
                editForm={editForm}
                setEditForm={setEditForm}
                savingProfile={savingProfile}
                profileMsg={profileMsg}
                setProfileMsg={setProfileMsg}
                onSave={saveProfile}
              />
              <SkillsSection
                skills={skills}
                newSkill={newSkill}
                setNewSkill={setNewSkill}
                addingSkill={addingSkill}
                skillMsg={skillMsg}
                onAdd={addSkills}
                onDelete={deleteSkill}
              />
            </div>
            <div className="lg:col-span-4">
              <CvUploadSection
                profile={profile}
                cvLoaded={cvLoaded}
                cvFileName={cvFileName}
                cvParsing={cvParsing}
                cvMsg={cvMsg}
                onUpload={handleCVFile}
              />
            </div>
          </div>
        )}
      </div>
    </CandidateContent>
  );
}
