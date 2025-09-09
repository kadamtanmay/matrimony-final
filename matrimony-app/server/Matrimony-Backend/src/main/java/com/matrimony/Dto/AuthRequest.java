package com.matrimony.Dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuthRequest  {
//	@NotEmpty
//	@Length(min=5,max=30)
//	@Email(message = "Invalid email format !!!")	
	private String email;
//	@NotEmpty
//	@Pattern(regexp = "((?=.*\\d)(?=.*[a-z])(?=.*[#@$*]).{5,20})", message = "Password format invalid !!!!!")
	private String password;

}
