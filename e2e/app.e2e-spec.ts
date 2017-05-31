import { Nhoa2Page } from './app.po';

describe('nhoa2 App', () => {
  let page: Nhoa2Page;

  beforeEach(() => {
    page = new Nhoa2Page();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
