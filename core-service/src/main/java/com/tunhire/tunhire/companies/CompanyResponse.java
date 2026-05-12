package com.tunhire.tunhire.companies;

public record CompanyResponse(
		Long id,
		String name,
		String slug,
		String description,
		String logoUrl,
		String website,
		String location
) {
}

