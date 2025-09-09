package com.matrimony.Dto;

import java.time.LocalDate;
import java.time.LocalDateTime;


import lombok.Getter;
import lombok.Setter;
import lombok.ToString;


@Setter
@Getter
@ToString
public class BaseDto {
private Long id;
	
	private LocalDate createdOn;
	
	private LocalDateTime updatedOn;
	
	
	
	

	   
	

}
