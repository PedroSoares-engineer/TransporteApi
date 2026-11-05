namespace TransporteApi.Models
{
    public class Ocorrencia
    {
        public int Id { get; set; }
        public int LinhaId { get; set; }
        public string LinhaCodigo { get; set; } = string.Empty;
        public string LinhaNome { get; set; } = string.Empty;
        public string UsuarioNome { get; set; } = string.Empty;
        public string Descricao { get; set; } = string.Empty;
        public DateTime DataHora { get; set; } = DateTime.Now;
        public bool Resolvido { get; set; } = false;
    }
}
