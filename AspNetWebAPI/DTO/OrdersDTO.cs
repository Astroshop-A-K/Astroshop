namespace AspNetCoreAPI.DTO
{
    public class OrdersDTO
    {
        public int OrderId { get; set; }
        public string? Name { get; set; }
        public string? Surname { get; set; }
        public string? Address { get; set; }
        public string? Email { get; set; }
        public int PSC { get; set; }
        public int PhoneNumber { get; set; }
        public string? DeliveryOption { get; set; }
        public string? Country { get; set; }
        public string? City { get; set; }
        public string? Payment { get; set; }
        public int TotalPrice { get; set; }
        public List<string>? SelectedProducs { get; set; }
    }
}
