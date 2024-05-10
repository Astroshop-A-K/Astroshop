using System.ComponentModel.DataAnnotations;

namespace AspNetCoreAPI.Models
{
    public class OrderProductsModel
    {
        [Key]
        public int OrderId { get; set; }
        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }
}
