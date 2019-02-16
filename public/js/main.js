const api = "http://localhost:3000/api/";

document.body.onload = () => {
    // let section = document.body.querySelector('section');
    // query(`accounts/1/codes`, 'get').then(codes => {
    //     codes.forEach(c => {
    //         let div = dom('div', 'item', section);
    //         let hd = dom('div', 'hd', div);
    //         dom('h4', [], hd).textContent = c.title;
    //         let bd = dom('div', 'bd', div);
    //         let pre = dom('pre', '', bd);
    //         dom('code', c.languaje, pre).textContent = c.text;
    //     });

    //     hljs.initHighlighting();
    // });

}

window.addEventListener('message', event => {
    let section = document.body.querySelector('section');
    let codes = event.data.codes;
    console.log(codes)
    Object.keys(codes).forEach(i => {
        let c = codes[i];
        let div = dom('div', 'item', section);
        let hd = dom('div', 'hd', div);
        dom('h4', [], hd).textContent = c.title;
        let bd = dom('div', 'bd', div);
        let pre = dom('pre', '', bd);
        dom('code', c.languaje, pre).textContent = c.text;
    });

    hljs.initHighlighting();
});

/**
 * 
 * @param {String} tag 
 * @param {[String] | String} classList 
 * @param {HTMLElement} parent 
 * @returns {HTMLElement}
 */
function dom(tag, classList = [], parent = document.body){
    let el = document.createElement(tag);
    return domlast = parent.appendChild(Object.assign(el, {className: (classList + '').replace(/\,/g, ' '), css: obj => (Object.assign(el.style, obj)), attr: obj => (Object.assign(el, obj)), setHTML: text => (Object.assign(el, {innerHTML: translate(text, localStorage.lg)}))}));
}

function query(url, method, data = {}) {
    let xhr = new XMLHttpRequest();
    xhr.open(method.toUpperCase(), `${api}${url}`);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(data));

    return new Promise((success, error) => {
        xhr.onloadend = () => {
            if (xhr.status == 200) success(JSON.parse(xhr.responseText))
            else error(JSON.parse(xhr.responseText));
        }
    });

}