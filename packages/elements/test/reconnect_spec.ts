/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Component,
  ComponentFactoryResolver,
  destroyPlatform,
  Input,
  NgModule,
} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {createCustomElement} from '../src/create-custom-element';

// TODO: fakeAsync/tick not working, using real timeout here
const tick = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('Reconnect', () => {
  let testContainer: HTMLDivElement;

  beforeAll((done) => {
    testContainer = document.createElement('div');
    document.body.appendChild(testContainer);
    destroyPlatform();
    platformBrowserDynamic()
      .bootstrapModule(TestModule)
      .then((ref) => {
        const injector = ref.injector;
        const cfr: ComponentFactoryResolver = injector.get(ComponentFactoryResolver);

        testElements.forEach((comp) => {
          const compFactory = cfr.resolveComponentFactory(comp);
          customElements.define(compFactory.selector, createCustomElement(comp, {injector}));
        });
      })
      .then(done, done.fail);
  });

  afterAll(() => {
    destroyPlatform();
    testContainer.remove();
    (testContainer as any) = null;
  });

  it('should be able to rebuild and reconnect after direct disconnection from parent', async () => {
    // Create and attach it
    const tpl = `<reconnect-el test-attr="a"></reconnect-el>`;
    testContainer.innerHTML = tpl;
    // Check that the Angular element was created and attributes are bound
    expect(testContainer.querySelector('.test-attr-outlet')!.textContent).toBe("a");
    // Check that the Angular element was bound to properties too
    const testEl = testContainer.querySelector<Element & ReconnectTestComponentEl>("reconnect-el")!;
    testEl.testProp = "b";
    expect(testContainer.querySelector('.test-prop-outlet')!.textContent).toBe("b");

    // Now detach the element from the container
    testContainer.removeChild(testEl);
    // Wait for detach timer
    await tick(10);
    // Check that the web-element is orphan and the Angular Component is destroyed
    expect(testEl.parentElement).toBeFalsy();
    // Check property values to be maintained
    expect(testEl.testProp).toBe("b");

    // Now reattach root to testContainer
    testContainer.appendChild(testEl);
    // Check for re-render, but with the same instance of web-element
    expect(testContainer.querySelectorAll<Element & ReconnectTestComponentEl>("reconnect-el").length).toBe(1);    
    expect(testContainer.querySelectorAll<Element & ReconnectTestComponentEl>(".reconnect-el").length).toBe(1);    
    expect(testContainer.querySelectorAll('.test-attr-outlet').length).toBe(1);
    expect(testContainer.querySelectorAll('.test-prop-outlet').length).toBe(1);
    expect(testContainer.querySelector('.test-attr-outlet')!.textContent).toBe("a");
    expect(testContainer.querySelector('.test-prop-outlet')!.textContent).toBe("b");
  });

  it('should be able to rebuild and reconnect after indirect disconnection via parent node', async () => {
    const tpl = `<div class="root"><reconnect-el test-attr="a"></reconnect-el></div>`;
    testContainer.innerHTML = tpl;
    const root = testContainer.querySelector<HTMLDivElement>(".root")!;
    // Check that the Angular element was created and attributes are bound
    expect(testContainer.querySelector('.test-attr-outlet')!.textContent).toBe("a");
    // Check that the Angular element was bound to properties too
    const testEl = testContainer.querySelector<Element & ReconnectTestComponentEl>("reconnect-el")!;
    testEl.testProp = "b";
    expect(testContainer.querySelector('.test-prop-outlet')!.textContent).toBe("b");

    // Now detach the root from the DOM
    testContainer.removeChild(root);
    // Wait for detach timer
    await tick(10);
    // Check that the web-element is still under root, but the Angular Component is destroyed
    expect(testEl.parentElement).toBe(root);
    // Check property values to be maintained
    expect(testEl.testProp).toBe("b");

    // Now reattach root to testContainer
    testContainer.appendChild(root);
    // Check for re-render, but with the same instance of web-element
    expect(testContainer.querySelector<Element & ReconnectTestComponentEl>("reconnect-el")).toBe(testEl);    
    expect(testContainer.querySelectorAll<Element & ReconnectTestComponentEl>("reconnect-el").length).toBe(1);    
    expect(testContainer.querySelectorAll<Element & ReconnectTestComponentEl>(".reconnect-el").length).toBe(1);
    expect(testContainer.querySelectorAll('.test-attr-outlet').length).toBe(1);
    expect(testContainer.querySelectorAll('.test-prop-outlet').length).toBe(1);
    expect(testContainer.querySelector('.test-attr-outlet')!.textContent).toBe("a");
    expect(testContainer.querySelector('.test-prop-outlet')!.textContent).toBe("b");
  });
});

interface ReconnectTestComponentEl {
  testProp: string;
}

@Component({
  selector: 'reconnect-el',
  template: '<div class="reconnect-el"><p class="test-prop-outlet">{{testProp}}</p><p class="test-attr-outlet">{{testAttr}}</p></div>'
})
class ReconnectTestComponent implements ReconnectTestComponentEl {
  @Input() testAttr: string = "";
  @Input() testProp: string = "";
  constructor() {}
}

const testElements = [
  ReconnectTestComponent
];

@NgModule({imports: [BrowserModule], declarations: testElements})
class TestModule {
  ngDoBootstrap() {}
}
