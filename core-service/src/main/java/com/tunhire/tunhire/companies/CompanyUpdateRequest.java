package com.tunhire.tunhire.companies;

public record CompanyUpdateRequest(
		String name,
		String description,
		String logoUrl,
		String website,
		String location
) {
}

