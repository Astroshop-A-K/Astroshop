using System.ComponentModel.DataAnnotations;

namespace AspNetCoreAPI.Models
{
    public class PendingUsersModel
    {
        [Key]
        public int Id { get; set; }
        public string? Email { get; set; }
        public string? PasswordHash { get; set; } 
        public string? Token { get; set; } 
        public DateTime ExpiresAt { get; set; } 
    }
}
