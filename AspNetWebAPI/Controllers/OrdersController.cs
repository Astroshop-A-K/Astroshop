using AspNetCoreAPI.Data;
using AspNetCoreAPI.DTO;
using AspNetCoreAPI.Models;
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
                        TotalPrice = ordersDTO.TotalPrice
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
    }
}
