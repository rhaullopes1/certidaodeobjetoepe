import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Check, Copy, ExternalLink, Link2, RefreshCw, Terminal } from "lucide-react";
import { PageShell } from "@/components/site/page-shell";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AGENT_APP_NAME, agentConnectionDetails } from "@/lib/agent-connection";

const TITLE = "Conectar assistentes | Certidão de Objeto e Pé";
const DESCRIPTION = "Instruções para conectar ChatGPT, Claude, Claude Code e outros assistentes à Certidão de Objeto e Pé e atualizar a conexão.";

export const Route = createFileRoute("/connect")({
  head: () => ({ meta: [
    { title: TITLE },
    { name: "description", content: DESCRIPTION },
    { property: "og:title", content: TITLE },
    { property: "og:description", content: DESCRIPTION },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: ConnectPage,
});

function Steps({ children }: { children: ReactNode }) {
  return <ol className="list-decimal space-y-4 pl-5 text-sm leading-7 text-foreground marker:font-semibold marker:text-primary">{children}</ol>;
}

function External({ href, children }: { href: string; children: ReactNode }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline underline-offset-4">{children}<ExternalLink className="ml-1 inline size-3.5" aria-hidden /></a>;
}

function CopyValue({ value, label, code = false }: { value: string; label: string; code?: boolean }) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  useEffect(() => {
    if (status === "idle") return;
    const timer = setTimeout(() => setStatus("idle"), 3000);
    return () => clearTimeout(timer);
  }, [status]);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setStatus("copied");
    } catch {
      setStatus("error");
    }
  }
  return <div>
    <div className="flex min-w-0 items-start gap-3 rounded-md border border-border bg-muted/40 p-4">
      {code ? <pre className="min-w-0 flex-1 whitespace-pre-wrap break-all text-sm leading-6"><code>{value || "Carregando comando…"}</code></pre>
        : <code className="min-w-0 flex-1 break-all text-base font-semibold leading-6">{value || "Carregando endereço…"}</code>}
      <Button variant="outline" size="icon" disabled={!value} onClick={copy} aria-label={label} title={label} className="shrink-0">
        {status === "copied" ? <Check aria-hidden /> : <Copy aria-hidden />}
      </Button>
    </div>
    <p role="status" aria-live="polite" className="min-h-6 text-sm text-muted-foreground">
      {status === "copied" ? "Copiado." : status === "error" ? "Não foi possível copiar. Selecione o texto acima e copie manualmente." : ""}
    </p>
  </div>;
}

function ConnectPage() {
  const [details, setDetails] = useState<ReturnType<typeof agentConnectionDetails> | null>(null);
  useEffect(() => { setDetails(agentConnectionDetails(window.location.origin)); }, []);

  return <PageShell>
    <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl">Conectar assistentes</h1>
      <section aria-labelledby="server-heading" className="mt-8">
        <h2 id="server-heading" className="mb-3 flex items-center gap-2 text-lg font-semibold"><Link2 className="size-5 text-primary" aria-hidden />Endereço do servidor MCP</h2>
        <CopyValue value={details?.mcpUrl ?? ""} label="Copiar endereço MCP" />
      </section>
      <Tabs defaultValue="chatgpt" className="mt-5">
        <TabsList aria-label="Escolher assistente" className="grid h-auto w-full grid-cols-2 gap-1 sm:grid-cols-4">
          <TabsTrigger value="chatgpt">ChatGPT</TabsTrigger>
          <TabsTrigger value="claude">Claude</TabsTrigger>
          <TabsTrigger value="code">Claude Code</TabsTrigger>
          <TabsTrigger value="other">Outros clientes</TabsTrigger>
        </TabsList>
        <TabsContent value="chatgpt" className="mt-8">
          <h2 className="mb-5 text-xl font-semibold">Conectar ao ChatGPT</h2>
          <Steps>
            <li>Abra as <External href="https://chatgpt.com/#settings/Connectors/Advanced">configurações de Apps do ChatGPT</External> e ative o <strong>Modo de desenvolvedor</strong>. Leia o aviso de risco; se a opção não estiver disponível, peça ao administrador do ChatGPT para habilitá-la.</li>
            <li>Abra <External href="https://chatgpt.com/plugins#settings/Connectors?create-connector=true&redirectAfter=%2Fplugins">Novo plugin</External>.</li>
            <li>Preencha o nome com <strong>{AGENT_APP_NAME}</strong> e cole o endereço MCP acima no campo de URL.</li>
            <li>Revise os dados, marque <strong>“I understand and want to continue”</strong> e clique em <strong>Create</strong>. Esse aviso aparece para todo servidor MCP personalizado. Conclua o login e autorize a conexão quando solicitado.</li>
            <li>Ative o app no campo de mensagem de uma conversa e peça ao ChatGPT para usar a Certidão de Objeto e Pé.</li>
          </Steps>
          <RefreshHeading />
          <Steps>
            <li>Abra a página <External href="https://chatgpt.com/plugins">Plugins do ChatGPT</External> e selecione este app.</li>
            <li>Vá até <strong>Information</strong> e clique em <strong>Refresh</strong>.</li>
            <li>Se o endereço mudou, exclua o app em Plugins e repita a conexão com o endereço atualizado acima. O ChatGPT não permite trocar a URL de um app existente.</li>
            <li>Inicie uma nova conversa e peça ao ChatGPT para usar o app.</li>
          </Steps>
        </TabsContent>
        <TabsContent value="claude" className="mt-8">
          <h2 className="mb-5 text-xl font-semibold">Conectar ao Claude</h2>
          <Steps>
            <li>{details ? <External href={details.claudeUrl}>Adicionar conector ao Claude</External> : "Carregando link do Claude…"} abre o formulário com nome e endereço preenchidos.</li>
            <li>Revise os dados e clique em <strong>Add</strong>. Conclua o login e autorize a conexão quando solicitado.</li>
            <li>Se o formulário não abrir preenchido, acesse <External href="https://claude.ai/customize/connectors">Conectores do Claude</External>, escolha <strong>Add custom connector</strong>, informe <strong>{AGENT_APP_NAME}</strong> e cole o endereço MCP acima.</li>
            <li>Ative o conector no campo de mensagem e peça ao Claude para usar a Certidão de Objeto e Pé.</li>
          </Steps>
          <RefreshHeading />
          <Steps>
            <li>Abra <External href="https://claude.ai/customize/connectors">Conectores do Claude</External> e selecione este conector.</li>
            <li>Atualize ou recarregue as ferramentas do conector.</li>
            <li>Se o endereço mudou, remova o conector e repita a conexão com o endereço atualizado acima. O Claude não permite trocar a URL de um conector existente.</li>
            <li>Peça ao Claude para usar o app.</li>
          </Steps>
        </TabsContent>
        <TabsContent value="code" className="mt-8">
          <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold"><Terminal className="size-5" aria-hidden />Conectar ao Claude Code</h2>
          <Steps>
            <li>Copie o comando abaixo e execute em um terminal:
              <div className="mt-3"><CopyValue value={details?.command ?? ""} label="Copiar comando Claude Code" code /></div>
            </li>
            <li>Inicie o Claude Code e execute <code>/mcp</code> para confirmar a conexão. Se as ferramentas exigirem autorização, faça login pelo menu e conclua a autorização.</li>
            <li>Peça ao Claude Code para usar a Certidão de Objeto e Pé.</li>
          </Steps>
          <RefreshHeading />
          <Steps>
            <li>Inicie uma nova sessão do Claude Code para carregar as ferramentas mais recentes.</li>
            <li>Se o endereço mudou, execute <code className="break-all">claude mcp remove {details?.slug ?? "certidao-de-objeto-e-pe"}</code> e depois execute novamente o comando de instalação acima, já com o endereço atualizado.</li>
            <li>Peça ao Claude Code para usar o app.</li>
          </Steps>
        </TabsContent>
        <TabsContent value="other" className="mt-8">
          <h2 className="mb-5 text-xl font-semibold">Conectar a outros clientes MCP</h2>
          <Steps>
            <li>Abra as configurações de servidores MCP ou conectores personalizados do assistente.</li>
            <li>Crie uma conexão com um servidor MCP remoto.</li>
            <li>Informe <strong>{AGENT_APP_NAME}</strong> como nome e cole o endereço MCP acima.</li>
            <li>Conclua as solicitações de login e autorização.</li>
            <li>Ative a conexão e peça ao assistente para usar o app.</li>
          </Steps>
          <RefreshHeading />
          <Steps>
            <li>Abra as configurações de servidores MCP ou conectores do assistente.</li>
            <li>Selecione a conexão criada para este app.</li>
            <li>Atualize a lista de ferramentas, recarregue o servidor ou reconecte.</li>
            <li>Se o endereço mudou, cole o endereço atualizado acima.</li>
            <li>Inicie uma nova conversa ou sessão e peça ao assistente para usar o app.</li>
          </Steps>
        </TabsContent>
      </Tabs>
    </div>
  </PageShell>;
}

function RefreshHeading() {
  return <div className="mb-5 mt-10 border-t border-border pt-8">
    <h2 className="flex items-center gap-2 text-xl font-semibold"><RefreshCw className="size-5 text-primary" aria-hidden />Atualizar após mudanças no app</h2>
    <p className="mt-3 text-sm leading-6 text-muted-foreground">O assistente guarda a lista de ferramentas. Após uma nova publicação do app, atualize a conexão para receber as mudanças.</p>
  </div>;
}