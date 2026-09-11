/* Shared observation notes and honest failure state; no simulated replacement for a failed 3D scene. */
(() => {
  let renderingError = false;
  window.addEventListener('error', event => {
    if (/WebGL|THREE is not defined/.test(event.message || '')) {
      renderingError = true;
      if(document.readyState !== 'loading') showMessage();
    }
  });
  function showMessage(text) {
    const lesson = document.body.dataset.lesson;
    if(lesson === 'coriolis' && !text) return;
    const target = document.querySelector(lesson==='magnet'?'#view':lesson==='ion'?'#view3d':lesson==='electric'?'#canvas-container':lesson==='coriolis'?'#canvasContainer':'body');
    if(!target) return;
    let box = target.querySelector('.render-message');
    if(!box){box=document.createElement('div');box.className='render-message';box.setAttribute('role','status');target.append(box);}
    box.textContent=text || 'このブラウザーでは3D表示を開始できませんでした。WebGLに対応したブラウザーで開き直してください。';
  }
  window.classroomRenderingMessage=showMessage;
  document.addEventListener('DOMContentLoaded',()=>{
    const lesson=document.body.dataset.lesson;
    // Small questions stay visible; explanations do not occupy the working area.
    if(lesson === 'ion') {
      const prompts={
        'ui-m1':'水だけ・食塩・砂糖。豆電球の様子と粒子に、どんな違いがある？',
        'ui-m2':'＋・−を入れかえると、電子・イオン・電極の変化はどうなる？',
        'ui-m3':'滴下を続けると、どのイオンが減り、どのイオンが残る？',
        'ui-m4':'金属板や膜の条件を変えると、電流はどうなる？'
      };
      const question=document.createElement('p');question.className='inquiry-question';
      question.setAttribute('aria-live','polite');document.querySelector('.stage-head').after(question);
      const labels={
        'ui-m1':['溶かす','電流を調べる','表示','粒子'],
        'ui-m2':['水溶液','電源','気体を調べる','電極'],
        'ui-m3':['水溶液','滴下','pH','イオン数'],
        'ui-m4':['電池','金属板','膜','接続','速さ']
      };
      document.querySelectorAll('.mod-ui').forEach(group=>{
        const cards=Array.from(group.querySelectorAll(':scope > .card'));
        const nav=document.createElement('div');nav.className='experiment-sections';nav.setAttribute('role','tablist');nav.setAttribute('aria-label','実験の操作と観察');
        const buttons=cards.map((card,i)=>{
          card.id=card.id||group.id+'-section-'+i;card.setAttribute('role','tabpanel');
          const button=document.createElement('button');button.type='button';button.id=card.id+'-tab';button.textContent=labels[group.id][i];button.setAttribute('role','tab');button.setAttribute('aria-controls',card.id);card.setAttribute('aria-labelledby',button.id);
          button.onclick=()=>select(i);button.onkeydown=e=>{let j;if(e.key==='ArrowRight')j=(i+1)%cards.length;if(e.key==='ArrowLeft')j=(i+cards.length-1)%cards.length;if(j!==undefined){e.preventDefault();select(j);buttons[j].focus();}};
          nav.append(button);return button;
        });
        function select(i){cards.forEach((card,j)=>{card.hidden=i!==j;buttons[j].setAttribute('aria-selected',String(i===j));buttons[j].tabIndex=i===j?0:-1;});}
        group.prepend(nav);select(group.id==='ui-m2'||group.id==='ui-m3'?1:0);
        new MutationObserver(()=>{if(group.classList.contains('show'))question.textContent=prompts[group.id];}).observe(group,{attributes:true,attributeFilter:['class']});
      });
      question.textContent=prompts[document.querySelector('.mod-ui.show').id];
    }
    if(renderingError)showMessage();
  });
})();
