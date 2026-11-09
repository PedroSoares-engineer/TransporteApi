using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TransporteApi.Data;
using TransporteApi.Models;

namespace TransporteApi.Controllers
{
    [ApiController]
    [Route("api/linhas")] // O nome do controlador é 'Linhas', logo a rota fica /api/linhas
    [Authorize] // Protege a rota exigindo o Token JWT
    public class LinhasController : ControllerBase
    {
        private readonly TransporteContext _context;

        public LinhasController(TransporteContext context)
        {
            _context = context;
        }

        // GET: api/linhas (Busca todas as linhas para o painel)
        [HttpGet]
        public IActionResult GetLinhas()
        {
            var linhas = _context.LinhasOnibus.ToList();
            return Ok(linhas);
        }

        // POST: api/linhas (Cadastra uma nova linha)
        [HttpPost]
        public IActionResult CadastrarLinha([FromBody] LinhaOnibus novaLinha)
        {
            if (novaLinha == null)
            {
                return BadRequest(new { mensagem = "Dados inválidos." });
            }

            _context.LinhasOnibus.Add(novaLinha);
            _context.SaveChanges();

            return Ok(new { mensagem = "Linha cadastrada com sucesso!" });
        }

        // DELETE: api/linhas/{id} (Exclui uma linha)
        [HttpDelete("{id}")]
        public IActionResult ExcluirLinha(int id)
        {
            var linha = _context.LinhasOnibus.Find(id);
            if (linha == null)
            {
                return NotFound(new { mensagem = "Linha não encontrada." });
            }

            _context.LinhasOnibus.Remove(linha);
            _context.SaveChanges();

            return Ok(new { mensagem = "Linha eliminada com sucesso." });
        }

        [HttpPut("{id}")]
        public IActionResult AtualizarHorario(int id, [FromBody] LinhaOnibus linhaAtualizada)
        {
            var linhaExiste = _context.LinhasOnibus.Find(id);
            if (linhaExiste == null)
            {
                return NotFound();
            }

            // Atualiza apenas o horário e mantém o resto intacto
            linhaExiste.ProximaPartida = linhaAtualizada.ProximaPartida;
            _context.SaveChanges();

            return Ok(linhaExiste);
        }

    }
}
