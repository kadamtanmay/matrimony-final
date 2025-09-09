package com.matrimony.CustomExceptions;

public class ResourceNotFoundException extends RuntimeException{
	public ResourceNotFoundException(String errMesg) {
		super(errMesg);
	}
	

}
