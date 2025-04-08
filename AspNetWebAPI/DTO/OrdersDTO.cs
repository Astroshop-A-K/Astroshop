using AspNetCoreAPI.Models;
using System.ComponentModel.DataAnnotations;
using System.Runtime.InteropServices;

namespace AspNetCoreAPI.DTO
{
    public class OrdersDTO
    {
        public int OrderId { get; set; }
        [Required]
        public string? Name { get; set; }
        [Required]
        public string? Surname { get; set; }
        [Required]
        public string? Address { get; set; }
        [Required]
        public string? Email { get; set; }
        [Required]
        public double PSC { get; set; }
        [Required]
        public double PhoneNumber { get; set; }
        [Required]
        public string? DeliveryOption { get; set; }
        [Required]
        public string? Country { get; set; }
        [Required]
        public string? City { get; set; }
        [Required]
        public string? Payment { get; set; }
        [Required]
        public double TotalPrice { get; set; }
        [Required]
        public string? OrderVerificationKey { get; set; }
        [Required]
        public string? OrderDate { get; set; }
        [Required]
        public string? OrderStatus { get; set;}
        public string? OrderNote { get; set; }
        [Required]
        public string RecaptchaResponse { get; set; }
        [Required]
        public List<OrderProductsDTO> OrderProducts { get; set; }
    }
}
