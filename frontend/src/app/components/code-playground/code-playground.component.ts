import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CodeService } from '../../services/code.service';
import { ToastService } from '../../services/toast.service';

declare const monaco: any;

@Component({
  selector: 'app-code-playground',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="playground-root animate-fade-in">
      <!-- Top Intelligence Bar -->
      <header class="ide-header glass-panel">
        <div class="header-left">
          <div class="terminal-badge">
             <div class="pulsar"></div>
             <span class="outfit">TERMINAL.EXE</span>
          </div>
          <div class="divider"></div>
          <div class="control-group">
            <label class="outfit mini-label">Environment</label>
            <select class="cyber-select" [(ngModel)]="language" (change)="changeLanguage()">
              <option value="javascript">Node.js (LTS)</option>
              <option value="python">Python 3.11</option>
              <option value="java">JDK 17 Runtime</option>
            </select>
          </div>
        </div>

        <div class="header-center">
           <div class="file-pill">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <span class="outfit">main.{{ getExt() }}</span>
           </div>
        </div>

        <div class="header-right">
          <button class="btn-execute" (click)="runCode()" [disabled]="isRunning">
            <div class="btn-inner">
               <svg *ngIf="!isRunning" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
               <div *ngIf="isRunning" class="spin-loader"></div>
               <span class="outfit">{{ isRunning ? 'Syncing...' : 'Execute Vector' }}</span>
            </div>
            <div class="btn-glow"></div>
          </button>
        </div>
      </header>

      <!-- Workbench -->
      <div class="workbench">
        <div class="editor-vortex glass-panel">
          <div class="vortex-header">
             <span class="outfit">Source Code</span>
             <span class="v-tag">UTF-8</span>
          </div>
          <div class="editor-frame" #editorContainer></div>
        </div>

        <!-- Output Terminal -->
        <div class="terminal-vortex glass-panel">
          <div class="vortex-header">
            <span class="outfit">Standard Output</span>
            <button class="wipe-btn" (click)="output = ''">Wipe Console</button>
          </div>
          <div class="terminal-core" #terminalBody>
            <div class="terminal-stream">
               <pre class="stream-text" [class.error-stream]="isError">{{ output }}</pre>
               <div *ngIf="isRunning" class="cursor-beam"></div>
            </div>
          </div>
          <div class="terminal-footer">
             <span class="status-chip" [class.active]="isRunning">
                {{ isRunning ? 'Isolated Sandbox Running' : 'System Ready' }}
             </span>
             <span class="v-tag">Docker Container v1.2</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .playground-root { 
       height: calc(100vh - 64px); background: #f8fafc; display: flex; flex-direction: column; 
       padding: 2rem; gap: 2rem; box-sizing: border-box; overflow: hidden;
    }

    .ide-header { 
       height: 70px; padding: 0 2rem; border-radius: 20px; display: flex; justify-content: space-between; align-items: center; 
       background: white; border: 1px solid #e2e8f0;
    }
    
    .header-left, .header-right { display: flex; align-items: center; gap: 2rem; }
    
    .terminal-badge { 
       display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 1rem; 
       background: #f1f5f9; border-radius: 12px; border: 1px solid #e2e8f0;
    }
    .pulsar { width: 8px; height: 8px; background: #059669; border-radius: 50%; box-shadow: 0 0 10px rgba(5, 150, 105, 0.4); animation: pulse 2s infinite; }
    @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
    .terminal-badge span { font-size: 0.75rem; font-weight: 800; color: #1e293b; letter-spacing: 0.1em; }

    .divider { width: 1px; height: 30px; background: #e2e8f0; }

    .control-group { display: flex; flex-direction: column; }
    .mini-label { font-size: 0.6rem; color: #64748b; text-transform: uppercase; font-weight: 900; margin-bottom: 2px; letter-spacing: 0.05em; }
    .cyber-select { 
       background: transparent; border: none; color: #1e293b; font-size: 0.85rem; font-weight: 700; cursor: pointer; outline: none; padding: 0;
    }
    .cyber-select option { background: #fff; color: #1e293b; }

    .file-pill { 
       display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 1.25rem; 
       background: rgba(99, 102, 241, 0.05); border: 1px solid rgba(99, 102, 241, 0.1); border-radius: 100px;
       color: var(--primary); font-size: 0.85rem; font-weight: 800; letter-spacing: 0.02em;
    }

    /* Execute Button */
    .btn-execute { position: relative; background: none; border: none; cursor: pointer; padding: 0; }
    .btn-inner { 
       position: relative; z-index: 10; display: flex; align-items: center; gap: 0.75rem; 
       background: var(--accent); color: #fff; padding: 0.75rem 1.5rem; border-radius: 12px; 
       font-weight: 900; font-size: 0.85rem; letter-spacing: 0.05em; text-transform: uppercase;
       transition: 0.3s cubic-bezier(0.23, 1, 0.32, 1);
    }
    .btn-glow { position: absolute; inset: 0; background: var(--accent); opacity: 0.3; filter: blur(15px); border-radius: 12px; transition: 0.3s; }
    .btn-execute:hover .btn-inner { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(16, 185, 129, 0.2); }
    .btn-execute:hover .btn-glow { opacity: 0.5; filter: blur(20px); }
    .btn-execute:disabled { opacity: 0.5; filter: grayscale(0.5); cursor: wait; }

    /* Workbench */
    .workbench { flex: 1; display: grid; grid-template-columns: 1.6fr 1fr; gap: 2rem; min-height: 0; }
    
    .editor-vortex { display: flex; flex-direction: column; overflow: hidden; border: 1px solid #e2e8f0; background: white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .vortex-header { 
       padding: 0.75rem 1.5rem; border-bottom: 1px solid #f1f5f9; 
       display: flex; justify-content: space-between; align-items: center; background: #f8fafc;
    }
    .vortex-header span { font-size: 0.7rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; }
    .v-tag { font-size: 0.6rem; color: #94a3b8; font-weight: 900; }
    .editor-frame { flex: 1; width: 100%; min-height: 0; }

    .terminal-vortex { display: flex; flex-direction: column; background: #0f172a; border: 1px solid #1e293b; }
    .wipe-btn { background: none; border: none; color: #64748b; font-size: 0.7rem; font-weight: 800; text-decoration: underline; cursor: pointer; }
    
    .terminal-core { flex: 1; padding: 2rem; overflow-y: auto; font-family: 'Fira Code', 'Consolas', monospace; }
    .terminal-stream { display: flex; flex-direction: column; }
    .stream-text { margin: 0; white-space: pre-wrap; font-size: 0.95rem; line-height: 1.6; color: #10b981; }
    .error-stream { color: #f87171; }
    .cursor-beam { width: 8px; height: 2px; background: var(--primary); margin-top: 5px; animation: blink 1s infinite; }
    @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

    .terminal-footer { 
       padding: 1rem 1.5rem; border-top: 1px solid rgba(255,255,255,0.1); 
       display: flex; justify-content: space-between; align-items: center;
    }
    .status-chip { 
       font-size: 0.65rem; font-weight: 800; text-transform: uppercase; color: #94a3b8; 
       background: rgba(255,255,255,0.05); padding: 0.2rem 0.6rem; border-radius: 4px;
    }
    .status-chip.active { color: #f59e0b; background: rgba(245, 158, 11, 0.1); }

    .spin-loader { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 1100px) {
       .workbench { grid-template-columns: 1fr; grid-template-rows: 1.2fr 1fr; }
    }
  `]
})
export class CodePlaygroundComponent implements AfterViewInit, OnDestroy {
  @ViewChild('editorContainer', { static: true }) editorContainer!: ElementRef;
  @ViewChild('terminalBody') terminalBody!: ElementRef;

  editor!: any;
  language = 'javascript';
  output = '>> System initialized. Select a language and click "Execute Vector" to begin.\n';
  isRunning = false;
  isError = false;

  defaultCode: {[key: string]: string} = {
    'javascript': 'console.log("Hello, Learngrid!");\n\nfunction fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\n// Change n to test\nconst n = 10;\nconsole.log(`Fibonacci of ${n} is ${fibonacci(n)}`);',
    'python': 'print("Hello, Learngrid!")\n\ndef fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n - 1) + fibonacci(n - 2)\n\n# Change n to test\nn = 10\nprint(f"Fibonacci of {n} is {fibonacci(n)}")',
    'java': 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, Learngrid!");\n        int n = 10;\n        System.out.println("Fibonacci of " + n + " is " + fibonacci(n));\n    }\n\n    public static int fibonacci(int n) {\n        if (n <= 1) return n;\n        return fibonacci(n - 1) + fibonacci(n - 2);\n    }\n}'
  };

  constructor(private codeService: CodeService, private toastService: ToastService) {}

  ngAfterViewInit() { this.initMonaco(); }
  getExt(): string {
    switch(this.language) {
      case 'javascript': return 'js';
      case 'python': return 'py';
      case 'java': return 'java';
      default: return 'txt';
    }
  }

  initMonaco() {
    const loader = (window as any).require;
    if (loader) {
      loader.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.47.0/min/vs' } });
      loader(['vs/editor/editor.main'], () => {
        this.editor = (window as any).monaco.editor.create(this.editorContainer.nativeElement, {
          value: this.defaultCode[this.language],
          language: this.language,
          theme: 'vs',
          automaticLayout: true,
          minimap: { enabled: false },
          fontSize: 14,
          padding: { top: 20 },
          roundedSelection: true,
          cursorSmoothCaretAnimation: "on",
          smoothScrolling: true,
          lineNumbersMinChars: 3,
          backgroundColor: '#ffffff'
        });
      });
    }
  }

  changeLanguage() {
    if (this.editor) {
      const monaco = (window as any).monaco;
       monaco.editor.setModelLanguage(this.editor.getModel()!, this.language);
      this.editor.setValue(this.defaultCode[this.language]);
    }
  }

  runCode() {
    if (!this.editor) return;
    this.isRunning = true;
    this.isError = false;
    this.output = `>> Executing main.${this.getExt()} in isolated sandbox...\n`;
    const code = this.editor.getValue();
    
    this.codeService.executeCode(this.language, code).subscribe({
      next: (res) => {
        this.output += res.output;
        this.isRunning = false;
        this.scrollToBottom();
        this.toastService.success('Transmission Finished');
      },
      error: () => {
        this.output += '\n[FATAL] Sandbox synchronization failed.';
        this.isError = true;
        this.isRunning = false;
        this.scrollToBottom();
      }
    });
  }

  scrollToBottom() {
    setTimeout(() => {
      if (this.terminalBody) this.terminalBody.nativeElement.scrollTop = this.terminalBody.nativeElement.scrollHeight;
    }, 50);
  }

  ngOnDestroy() { if (this.editor) this.editor.dispose(); }
}
