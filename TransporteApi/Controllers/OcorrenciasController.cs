using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TransporteApi.Data;
using TransporteApi.Models;

namespace TransporteApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class OcorrenciasController : ControllerBase
    {
        private readonly TransporteContext _context;

        public OcorrenciasController(TransporteContext context)
        {
            _context = context;
        }

        // POST: api/ocorrencias (Qualquer utilizador autenticado pode reportar)
        [HttpPost]
        public IActionResult ReportarProblema([FromBody] Ocorrencia ocorrencia)
        {
            var nomeUsuario = User.Identity?.Name ?? "Passageiro Anónimo";

            ocorrencia.UsuarioNome = nomeUsuario;
            ocorrencia.DataHora = DateTime.Now;
            ocorrencia.Resolvido = false;

            _context.Ocorrencias.Add(ocorrencia);
            _context.SaveChanges();

            return Ok(new { mensagem = "Ocorrência registada e enviada para a gestão!" });
        }

        // GET: api/ocorrencias (Listar todas as ocorrências ativas)
        [HttpGet]
        public IActionResult ObterOcorrencias()
        {
            var lista = _context.Ocorrencias
                .OrderByDescending(o => o.DataHora)
                .ToList();

            return Ok(lista);
        }

        // PUT: api/ocorrencias/{id}/resolver (Marcar como resolvida)
        [HttpPut("{id}/resolver")]
        public IActionResult ResolverOcorrencia(int id, [FromQuery] string mensagem = "")
        {
            var ocorrencia = _context.Ocorrencias.Find(id);
            if (ocorrencia == null) return NotFound();

            ocorrencia.Resolvido = true;

            // Anexa a mensagem oficial da equipa para o passageiro ler
            if (!string.IsNullOrEmpty(mensagem))
            {
                ocorrencia.Descricao = ocorrencia.Descricao + "\n\n⚠️ RESPOSTA DA EQUIPA: " + mensagem;
            }

            _context.SaveChanges();
            return Ok(ocorrencia);
        }
    }
}
