async function main() {

    loadArtwork();
    sayHello();

    
}

function sayHello() {
    const fg = ['red','orange','yellow','green','blue','indigo','violet'];
    const bg = fg.map(c=>`dark${c}`);

    const s = fg.map(o=> `background: ${o}; color: ${bg[fg.indexOf(o)]}; font-size: 20pt; font-family: serif; weight: bold`);

    const message = [
        ''
        ,'Hello'
        ,'there'
        ,'how'
        ,'are'
        ,'you'                
        ,'doing'                
        , 'today?'
    ].join(' %c');

    console.log(message,s[0],s[1],s[2],s[3],s[4],s[5],s[6]);
}