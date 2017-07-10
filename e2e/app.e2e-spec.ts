import { FeedbackPage } from './app.po';

describe('feedback App', () => {
  let page: FeedbackPage;

  beforeEach(() => {
    page = new FeedbackPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
