using System.Text.Json;

namespace AspNetCoreAPI.Services
{
    public class RecaptchaService
    {
        private readonly IConfiguration _configuration;
        private readonly IHttpClientFactory _httpClientFactory;

        public RecaptchaService(IConfiguration configuration, IHttpClientFactory httpClientFactory)
        {
            _configuration = configuration;
            _httpClientFactory = httpClientFactory;
        }

        public async Task<bool> VerifyCaptcha(string captcha)
        {
            if (string.IsNullOrEmpty(captcha))
            {
                return false;
            }
            var secretKey = _configuration["GoogleReCaptcha:SecretKey"];
            var verificationUrl = $"https://www.google.com/recaptcha/api/siteverify?secret={secretKey}&response={captcha}";

            var client = _httpClientFactory.CreateClient();
            HttpResponseMessage response = client.GetAsync(verificationUrl).Result;

            if (!response.IsSuccessStatusCode)
            {
                return false;
            }

            var responseContent = await response.Content.ReadAsStringAsync();

            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
            };

            var recaptchaResponse = JsonSerializer.Deserialize<RecaptchaVerificationResponse>(responseContent, options);

            return recaptchaResponse?.Success ?? false;
        }
        public class RecaptchaVerificationResponse
        {
            public bool Success { get; set; }
            public string ChallengeTs { get; set; }
            public string Hostname { get; set; }
            public List<string> ErrorCodes { get; set; } = new List<string>();
        }
    }
}
