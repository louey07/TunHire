package com.tunhire.tunhire.common;

public record ApiResponse<T>(boolean success, String message, T data) {
	public static <T> ApiResponse<T> ok(String message, T data) {
		return new ApiResponse<>(true, message, data);
	}

	public static <T> ApiResponse<T> fail(String message) {
		return new ApiResponse<>(false, message, null);
	}
}

