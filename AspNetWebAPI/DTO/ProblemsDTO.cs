namespace AspNetCoreAPI.DTO
{
    public class ProblemsDTO
    {
        public int ProblemId { get; set; }
        public string? NameSurname { get; set; }
        public string? Email { get; set; }
        public string? Problem { get; set; }
        public string? ProblemDate { get; set; }
        public string? ProblemStatus { get; set; }
    }
}
