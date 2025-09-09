using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace matrimony_subscription.Models
{
    [Table("Users")]
    public class User
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("id")]
        public long Id { get; set; }

        [Column("first_name")]
        public string? FirstName { get; set; }
        
        [Column("last_name")]
        public string? LastName { get; set; }
        
        [Column("email")]
        [EmailAddress]
        public string? Email { get; set; }
        
        [Column("password")]
        public string? Password { get; set; }
        
        [Column("gender")]
        public string? Gender { get; set; }
        
        [Column("date_of_birth")]
        public DateTime? DateOfBirth { get; set; }
        
        [Column("phone")]
        public string? Phone { get; set; }
        
        [Column("address")]
        public string? Address { get; set; }
        
        [Column("marital_status")]
        public string? MaritalStatus { get; set; }
        
        [Column("religion")]
        public string? Religion { get; set; }
        
        [Column("caste")]
        public string? Caste { get; set; }
        
        [Column("mother_tongue")]
        public string? MotherTongue { get; set; }
        
        [Column("education")]
        public string? Education { get; set; }
        
        [Column("profession")]
        public string? Profession { get; set; }
        
        [Column("annual_income")]
        public string? AnnualIncome { get; set; }
        
        [Column("hobbies")]
        public string? Hobbies { get; set; }
        
        [Column("bio")]
        public string? Bio { get; set; }
        
        [Column("age")]
        public int? Age { get; set; }
        
        [Column("location")]
        public string? Location { get; set; }

        [Column("subscription_status")]
        public int? SubscriptionStatus { get; set; }
    }
}
