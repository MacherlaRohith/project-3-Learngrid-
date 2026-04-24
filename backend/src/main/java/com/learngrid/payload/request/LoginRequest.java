package com.learngrid.payload.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LoginRequest {
	@NotBlank
	@Size(max = 100)
	private String email;

	@NotBlank
	private String password;
}
