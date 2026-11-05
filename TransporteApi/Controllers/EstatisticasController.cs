using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TransporteApi.Data;

namespace TransporteApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    // A MÁGICA DA SEGURANÇA: Só quem tem o Token de "Proprietario" pode aceder a isto!
    [Authorize(Roles = "Proprietario")]
    public class EstatisticasController : ControllerBase
    {
        private readonly TransporteContext _context;

        public EstatisticasController(TransporteContext context)
        {
            _context = context;
        }

        [HttpGet("dashboard")]
        public IActionResult ObterEstatisticas()
        {
            // O C# vai à base de dados (SQLite) e conta tudo em tempo real
            var totalUsuarios = _context.Usuarios.Count();
            var totalAdmins = _context.Usuarios.Count(u => u.Regra == "Admin");
            var totalLinhas = _context.LinhasOnibus.Count();

            // Retornamos os dados formatados para o React
            return Ok(new
            {
                usuarios = totalUsuarios,
                admins = totalAdmins,
                linhas = totalLinhas,
                cidades = 0 // (Deixamos a 0 por agora, até implementarmos o cadastro de cidades)
            });
        }
    }
}
