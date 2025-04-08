using System.ComponentModel.DataAnnotations;

namespace AspNetCoreAPI.DTO
{
    public class OrderProductsDTO
    {
        [Required]
        public int ProductId { get; set; }
        [Required]
        public int Quantity { get; set; }
    }
}
