namespace TransporteApi.Models
{
    public class Usuario
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string SenhaHash { get; set; } = string.Empty;
        public string Regra { get; set; } = "Comum";

        // Novos campos para o Usuário Comum (Passageiro)
        public string? Telefone { get; set; }
        public DateTime? DataNascimento { get; set; }
        public string? Cidade { get; set; }
        public string? Estado { get; set; }
    }
}
