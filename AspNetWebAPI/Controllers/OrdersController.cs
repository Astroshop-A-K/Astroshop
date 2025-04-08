using AspNetCoreAPI.Data;
using AspNetCoreAPI.DTO;
using AspNetCoreAPI.Models;
using AspNetCoreAPI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AspNetCoreAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class OrdersController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly RecaptchaService _recaptchaService;

        public OrdersController(ApplicationDbContext context, RecaptchaService recaptchaService)
        {
            _context = context;
            _recaptchaService = recaptchaService;
        }

        [HttpPost("create-order")]
        public async Task<IActionResult> CreateOrder([FromBody] OrdersDTO ordersDTO)
        {
            try
            {
                var isRecaptchaValid = await _recaptchaService.VerifyCaptcha(ordersDTO.RecaptchaResponse);

                if (!isRecaptchaValid)
                {
                    return BadRequest(new { message = "An error occurred while trying to verify recaptcha." });
                }

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
                    OrderDate = ordersDTO.OrderDate,
                    OrderStatus = ordersDTO.OrderStatus,
                    OrderNote = ordersDTO.OrderNote
                };

                _context.Orders.Add(newOrder);
                await _context.SaveChangesAsync();

                foreach(var orderProduct in ordersDTO.OrderProducts)
                {
                    var newOrderProduct = new OrderProductsModel
                    {
                        OrderId = newOrder.OrderId,
                        ProductId = orderProduct.ProductId,
                        Quantity = orderProduct.Quantity
                    };

                    _context.OrderProducts.Add(newOrderProduct);
                }

                await _context.SaveChangesAsync();

                return Ok(newOrder.OrderId);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred.", details = ex.Message });
            }
        }
        [HttpGet("get-orders")]
        public async Task<ActionResult<IEnumerable<OrdersDTO>>> GetOrders()
        {
            try
            {
                return await _context.Orders.Select(o => new OrdersDTO
                {
                    OrderId = o.OrderId,
                    OrderVerificationKey = o.OrderVerificationKey,
                    DeliveryOption = o.DeliveryOption,
                    Address = o.Address,
                    City = o.City,
                    Country = o.Country,
                    Email = o.Email,
                    Name = o.Name,
                    Payment = o.Payment,
                    PhoneNumber = o.PhoneNumber,
                    PSC = o.PSC,
                    Surname = o.Surname,
                    TotalPrice = o.TotalPrice,
                    OrderDate = o.OrderDate,
                    OrderStatus = o.OrderStatus,
                    OrderNote = o.OrderNote
                }).ToListAsync();
            }
            catch(Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred.", details = ex.Message });
            }
        }
        [HttpGet("get-order-details")]
        public async Task<ActionResult<OrdersDTO>> GetOrderDetails([FromQuery] int orderId)
        {
            try
            {
                var orderDto = await _context.Orders
                    .Where(o => o.OrderId == orderId)
                    .Select(order => new OrdersDTO
                    {
                        OrderId = order.OrderId,
                        OrderVerificationKey = order.OrderVerificationKey,
                        DeliveryOption = order.DeliveryOption,
                        Address = order.Address,
                        City = order.City,
                        Country = order.Country,
                        Email = order.Email,
                        Name = order.Name,
                        Payment = order.Payment,
                        PhoneNumber = order.PhoneNumber,
                        PSC = order.PSC,
                        Surname = order.Surname,
                        TotalPrice = order.TotalPrice,
                        OrderDate = order.OrderDate,
                        OrderStatus = order.OrderStatus,
                        OrderNote = order.OrderNote
                    }).FirstOrDefaultAsync();

                if (orderDto == null)
                {
                    return NotFound();
                }

                return Ok(orderDto);
            }
            catch(Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred.", details = ex.Message });
            }
        }
        [HttpGet("get-order-products")]
        public async Task<ActionResult<List<ProductsDTO>>> GetOrderProducts([FromQuery] int orderId)
        {
            try
            {
                var orderProducts = await _context.OrderProducts
                .Where(p => p.OrderId == orderId)
                .Select(r => new OrderProductsDTO
                {
                    ProductId = r.ProductId,
                    Quantity = r.Quantity,
                })
                .ToListAsync();

                if (orderProducts.Count == 0)
                {
                    return NotFound();
                }

                List<ProductsDTO> products = new List<ProductsDTO>();

                foreach (var orderProduct in orderProducts)
                {
                    var product = await _context.Products.FirstOrDefaultAsync(p => p.ProductId == orderProduct.ProductId);

                    if (product != null)
                    {
                        ProductsDTO info = new ProductsDTO
                        {
                            ProductName = product.ProductName,
                            Quantity = orderProduct.Quantity,
                            Price = product.Price,
                            ProductImage0 = product.ProductImage0,
                            ProductDiscount = product.ProductDiscount
                        };

                        products.Add(info);
                    }
                }
                return Ok(products);
            }
            catch(Exception ex) 
            {
                return StatusCode(500, new { message = "An error occurred.", details = ex.Message });
            }
        }
        [HttpPut("change-order-status")]
        public async Task<ActionResult> ChangeOrderStatus([FromBody] ChangeOrderStatusDTO orderStatusDTO)
        {
            var order = await _context.Orders.FirstOrDefaultAsync(o => o.OrderId == orderStatusDTO.OrderId);

            if(order == null)
            {
                return NotFound("Order");
            }

            order.OrderStatus = orderStatusDTO.OrderStatus;
            await _context.SaveChangesAsync();

            return Ok( new { OrderStatus = order.OrderStatus });
        }
    }
}
