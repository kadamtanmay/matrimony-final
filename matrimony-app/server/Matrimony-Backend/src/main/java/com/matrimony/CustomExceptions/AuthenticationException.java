package com.matrimony.CustomExceptions;

public class AuthenticationException extends RuntimeException{
	public AuthenticationException(String errMesg) {
		super(errMesg);
	}

}
