using System.ComponentModel.DataAnnotations;

namespace AspNetCoreAPI.DTO
{
    public class ChangeOrderStatusDTO
    {
        [Required]
        public int OrderId { get; set; }
        [Required]
        public string? OrderStatus { get; set; }
    }
}
