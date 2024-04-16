using AspNetCoreAPI.DTO;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Numerics;

namespace AspNetCoreAPI.Models
{
    public class OrdersModel
    {
        [Key]
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
    }
}
