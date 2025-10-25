/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    tinymce: any;
  }
}

interface TinyEditorProps {
  initialContent?: string;
  onContentChange?: (content: string) => void;
  plugins?: string[];
  content_style?: string;
  variables?: {
    group: string; label: string; variable: string
  }[]; // NUEVO: lista de variables para el menú
}

const TinyEditorComponent = ({
  initialContent = '',
  onContentChange,
  plugins = [
    'advlist',
    'autolink',
    'lists',
    'link',
    'image',
    'charmap',
    'preview',
    'anchor',
    'searchreplace',
    'visualblocks',
    'code',
    'fullscreen',
    'insertdatetime',
    'media',
    'table',
    'help',
    'wordcount',
    'template',
    'emoticons',
    'codesample',
  ],
  content_style = `
            body { font-family: Arial,Helvetica,sans-serif; font-size: 13px; line-height: 19px; color: #262626; }
            p { margin: 0; }
          `,
  variables = [], // [{ label, variable, group }]
}: TinyEditorProps) => {
  const editorRef = useRef<any>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = '/js/tinymce/tinymce.min.js'; // TinyMCE local
    script.referrerPolicy = 'origin';

    script.onload = () => {
      if (window.tinymce) {
        window.tinymce.init({
          selector: '#tiny-editor',
          height: '100%',
          menubar: false,
          skin_url: '/js/tinymce/skins/ui/oxide',
          content_css: ['/js/tinymce/skins/content/default/content.min.css'],
          content_style,
          language_url: '/js/tinymce/langs/es.js',
          language: 'es',
          license_key: 'gpl',

          plugins,
          toolbar_mode: 'wrap',

          extended_valid_elements:
            'iframe[src|frameborder|style|scrolling|class|width|height|name|align|allowfullscreen]',
          media_live_embeds: true,

          toolbar: `variablesButton | mejorarIA | undo redo | bold italic underline strikethrough | 
            alignleft aligncenter alignright alignjustify | 
            bullist numlist outdent indent | 
            forecolor backcolor | 
            link unlink anchor | image media emoticons | 
            fontselect fontsizeselect | table | 
            math | code | fullscreen | preview
          `,
          browser_spellcheck: true,
          contextmenu: false,
          branding: false,

          setup: (editor: any) => {
            editorRef.current = editor;
            // Botón personalizado para insertar variables
            // Agrupar variables por grupo (lead, preguntas)
            const leadVars = variables.filter(v => v.group === 'lead');
            const questionVars = variables.filter(v => v.group === 'question');

            editor.ui.registry.addMenuButton('variablesButton', {
              text: 'Insertar variable',
              fetch: (callback: any) => {
                const items = [];
                if (leadVars.length > 0) {
                  items.push({
                    type: 'nestedmenuitem',
                    text: 'Variables del Lead',
                    getSubmenuItems: () => leadVars.map(v => ({
                      type: 'menuitem',
                      text: v.label,
                      onAction: () => editor.insertContent(v.variable),
                    }))
                  });
                }
                if (questionVars.length > 0) {
                  items.push({
                    type: 'nestedmenuitem',
                    text: 'Variables de Preguntas',
                    getSubmenuItems: () => questionVars.map(v => ({
                      type: 'menuitem',
                      text: v.label,
                      onAction: () => editor.insertContent(v.variable),
                    }))
                  });
                }
                callback(items);
              },
            });



            editor.on('Change KeyUp', () => {
              const content = editor.getContent();
              if (onContentChange) {
                onContentChange(content);
              }
            });
          },

          init_instance_callback: (editor: any) => {
            editor.setContent(initialContent);
          },
        });
      }
    };

    document.body.appendChild(script);

    return () => {
      if (window.tinymce) {
        window.tinymce.remove();
      }
    };
  }, []);

  return <textarea id="tiny-editor" />;
};

export default TinyEditorComponent;
