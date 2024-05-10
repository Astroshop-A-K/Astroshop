using AspNetCoreAPI.Data;
using AspNetCoreAPI.DTO;
using AspNetCoreAPI.Models;
using Azure.Core;
using Microsoft.AspNetCore.Mvc;

namespace AspNetCoreAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class OrdersController : Controller
    {
        private readonly ApplicationDbContext _context;

        public OrdersController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPut("create-order")]
        public ActionResult<OrdersDTO> CreateOrder([FromBody] OrdersDTO ordersDTO)
        {
            try
            {
                using (var context = _context)
                {
                    var newOrder = new OrdersModel
                    {
                        OrderId = ordersDTO.OrderId,
                        Name = ordersDTO.Name,
                        Surname = ordersDTO.Surname,
                        Email = ordersDTO.Email,
                        PhoneNumber = ordersDTO.PhoneNumber,
                        Address = ordersDTO.Address,
                        PSC = ordersDTO.PSC,
                        City = ordersDTO.City,
                        Country = ordersDTO.Country,
                        DeliveryOption = ordersDTO.DeliveryOption,
                        Payment = ordersDTO.Payment,
                        TotalPrice = ordersDTO.TotalPrice,
                        OrderVerificationKey = ordersDTO.OrderVerificationKey,
                    };

                    context.Orders.Add(newOrder);
                    context.SaveChanges();

                    var info = new OrdersDTO
                    {
                        OrderId = ordersDTO.OrderId,
                        Name = ordersDTO.Name,
                        Surname = ordersDTO.Surname,
                        Email = ordersDTO.Email,
                        PhoneNumber = ordersDTO.PhoneNumber,
                        Address = ordersDTO.Address,
                        PSC = ordersDTO.PSC,
                        City = ordersDTO.City,
                        Country = ordersDTO.Country,
                        DeliveryOption = ordersDTO.DeliveryOption,
                        Payment = ordersDTO.Payment,
                        TotalPrice = ordersDTO.TotalPrice,
                        OrderVerificationKey = ordersDTO.OrderVerificationKey
                    };

                    return Ok(info);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error");
                return StatusCode(500, new { message = "Mame problem." });
            }
        }
        [HttpGet("{orderVerificationKey}")]
        public ActionResult<int> GetOrderId(string orderVerificationKey)
        {
            var order = _context.Orders.FirstOrDefault(o => o.OrderVerificationKey == orderVerificationKey);

            if(order == null)
            {
                return NotFound();
            }

            return Ok(order.OrderId);
        }
        [HttpPut("add-productId")]
        public ActionResult<OrderProductsDTO> AddProductId([FromBody] OrderProductsDTO orderProductsDTO)
        {
            try
            {
                var newRow = new OrderProductsModel
                {
                    ProductId = orderProductsDTO.ProductId,
                    OrderId = orderProductsDTO.OrderId,
                    Quantity = orderProductsDTO.Quantity
                };

                _context.OrderProducts.Add(newRow);
                _context.SaveChanges();

                return Ok("Success!");
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error: " + ex.Message); 
                return StatusCode(500, new { message = "Internal server error" });
            }
        }
    }
}
