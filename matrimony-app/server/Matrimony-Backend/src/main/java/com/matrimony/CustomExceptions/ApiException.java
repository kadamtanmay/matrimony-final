package com.matrimony.CustomExceptions;

public class ApiException extends RuntimeException{
	public ApiException(String errMesg) {
		super(errMesg);
	}

}
