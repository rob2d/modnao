import {
  documentGetInitialProps,
  DocumentHeadTags,
  type DocumentHeadTagsProps
} from '@mui/material-nextjs/v13-pagesRouter';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import Document, {
  type DocumentContext,
  type DocumentInitialProps,
  Head,
  Html,
  Main,
  NextScript
} from 'next/document';

type ModNaoDocumentProps = DocumentInitialProps & DocumentHeadTagsProps;

export default class ModNaoDocument extends Document<ModNaoDocumentProps> {
  static async getInitialProps(
    ctx: DocumentContext
  ): Promise<ModNaoDocumentProps> {
    return documentGetInitialProps(ctx);
  }

  render() {
    return (
      <Html lang='en'>
        <Head>
          <DocumentHeadTags {...this.props} />
        </Head>
        <body>
          <InitColorSchemeScript />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
