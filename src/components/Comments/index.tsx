import { Component, HtmlHTMLAttributes } from 'react';

type Props = HtmlHTMLAttributes<HTMLDivElement>;

export default class Comments extends Component<Props> {
  componentDidMount(): void {
    const script = document.createElement('script');
    const anchor = document.getElementById('inject-comments-for-utterances');
    script.setAttribute('src', 'https://utteranc.es/client.js');
    script.setAttribute('crossorigin', 'anonymous');
    script.setAttribute('async', String(true));
    script.setAttribute('repo', 'viniciusnascimento95/spacetraveling-create-blog');
    script.setAttribute('issue-term', 'pathname');
    script.setAttribute('theme', 'github-dark');
    anchor.appendChild(script);
  }

  render(): JSX.Element {
    return <div id="inject-comments-for-utterances" {...this.props} />;
  }
}