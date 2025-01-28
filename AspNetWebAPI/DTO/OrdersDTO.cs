using AspNetCoreAPI.Models;
using System.Runtime.InteropServices;

namespace AspNetCoreAPI.DTO
{
    public class OrdersDTO
    {
        public int OrderId { get; set; }
        public string? Name { get; set; }
        public string? Surname { get; set; }
        public string? Address { get; set; }
        public string? Email { get; set; }
        public double PSC { get; set; }
        public double PhoneNumber { get; set; }
        public string? DeliveryOption { get; set; }
        public string? Country { get; set; }
        public string? City { get; set; }
        public string? Payment { get; set; }
        public double TotalPrice { get; set; }
        public string? OrderVerificationKey { get; set; }
        public string? OrderDate { get; set; }
        public string? OrderStatus { get; set;}
        public string? OrderNote { get; set; }
        public string RecaptchaResponse { get; set; }
    }
}
