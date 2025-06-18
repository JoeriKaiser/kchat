import DOMPurify from "dompurify";
import hljs from "highlight.js";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";

const marked = new Marked(
	markedHighlight({
		langPrefix: "hljs language-",
		highlight(code, lang) {
			const language = hljs.getLanguage(lang) ? lang : "plaintext";
			return hljs.highlight(code, { language }).value;
		},
	}),
);

marked.setOptions({
	gfm: true,
	breaks: true,
});

function cleanHtml(html: string): string {
	return html.replace(/>\s+</g, "><").trim();
}

marked.use({
	renderer: {
		code(token) {
			const highlightedHtml = token.text;
			const rawCode = token.raw;
			const language = token.lang || "plaintext";

			return cleanHtml(`
        <div class="custom-code-block relative rounded-lg border border-timberwolf-600 bg-timberwolf-700 overflow-hidden my-4">
          <div class="flex items-center justify-between px-4 py-2 bg-pale_dogwood-500">
            <span class="text-xs font-medium text-timberwolf-100 uppercase tracking-wide">${language}</span>
            <button
              class="copy-code-btn flex items-center justify-center w-8 h-8 text-timberwolf-100 hover:text-isabelline-500 hover:bg-isabelline-300 rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-linen-500 focus:ring-opacity-50"
              data-code="${encodeURIComponent(rawCode)}"
              title="Copy code"
              aria-label="Copy code to clipboard"
            >
              <svg class="w-4 h-4 copy-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                <path d="m4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
              </svg>
              <svg class="w-4 h-4 check-icon hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </button>
          </div>
          <pre class="m-0 p-4 overflow-auto text-sm leading-relaxed whitespace-pre-wrap break-words bg-isabelline-100"><code class="hljs language-${language}">${highlightedHtml}</code></pre>
        </div>
      `);
		},
	},
});

export function parseAndSanitize(content: string): string {
	const processedContent = content;
	const dirtyHtml = marked.parse(processedContent) as string;
	const cleanHtml = DOMPurify.sanitize(dirtyHtml, {
		ADD_TAGS: ["button"],
		ADD_ATTR: ["data-code", "title", "aria-label", "class"],
	});
	return cleanHtml;
}

export function setupCodeCopyHandlers(container: HTMLElement): () => void {
	const handleCopyClick = async (event: Event) => {
		event.preventDefault();
		const button = event.currentTarget as HTMLElement;
		const codeData = button.getAttribute("data-code");

		if (!codeData) return;

		try {
			const decodedCode = decodeURIComponent(codeData);
			await navigator.clipboard.writeText(decodedCode);

			const copyIcon = button.querySelector(".copy-icon");
			const checkIcon = button.querySelector(".check-icon");

			if (copyIcon && checkIcon) {
				copyIcon.classList.add("hidden");
				checkIcon.classList.remove("hidden");
				button.title = "Copied!";

				setTimeout(() => {
					copyIcon.classList.remove("hidden");
					checkIcon.classList.add("hidden");
					button.title = "Copy code";
				}, 2000);
			}
		} catch (error) {
			console.error("Failed to copy code:", error);
		}
	};

	const copyButtons = container.querySelectorAll(".copy-code-btn");

	for (const button of copyButtons) {
		button.addEventListener("click", handleCopyClick);
	}

	return () => {
		for (const button of copyButtons) {
			button.removeEventListener("click", handleCopyClick);
		}
	};
}
