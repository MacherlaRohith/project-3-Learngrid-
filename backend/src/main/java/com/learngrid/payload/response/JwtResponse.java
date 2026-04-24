package com.learngrid.payload.response;

import lombok.Data;
import java.util.List;

@Data
public class JwtResponse {
	private String token;
	private String type = "Bearer";
	private Long id;
	private String username;
	private String email;
	private List<String> roles;
	private Boolean isVerified;

	public JwtResponse(String accessToken, Long id, String username, String email, List<String> roles, Boolean isVerified) {
		this.token = accessToken;
		this.id = id;
		this.username = username;
		this.email = email;
		this.roles = roles;
		this.isVerified = isVerified;
	}
}
