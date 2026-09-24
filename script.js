const coins=document.querySelector("#coins"),results=document.querySelector("#results"),search=document.querySelector("#search"),refresh=document.querySelector("#refresh");

const ids=["bitcoin","ethereum","binancecoin","solana","ripple","cardano","dogecoin","avalanche-2"];
const names={
  bitcoin:["Bitcoin","BTC"], ethereum:["Ethereum","ETH"], "binancecoin":["BNB","BNB"],
  solana:["Solana","SOL"], ripple:["XRP","XRP"], cardano:["Cardano","ADA"],
  dogecoin:["Dogecoin","DOGE"], "avalanche-2":["Avalanche","AVAX"]
};
let market=[];

const money=n=>{
  n=Number(n);
  return "$"+n.toLocaleString(undefined,{maximumFractionDigits:n>=1000?2:n>=1?3:6});
};

function render(){
  if(!market.length){
    coins.innerHTML='<div class="message">No market data available. Try refresh.</div>';
    return;
  }

  coins.innerHTML=market.map((c,i)=>{
    const n=names[c.id]||[c.name,c.symbol.toUpperCase()];
    const change=Number(c.price_change_percentage_24h||0);
    return `<article class="card">
      <div class="top">
        <div><span class="icon">${n[1][0]}</span><b>${n[0]}</b><div class="muted">${n[1]}/USD</div></div>
        <small class="muted">#${i+1}</small>
      </div>
      <div class="price">${money(c.current_price)}</div>
      <div class="change ${change>=0?"up":"down"}">${change>=0?"▲":"▼"} ${Math.abs(change).toFixed(2)}% 24h</div>
    </article>`;
  }).join("");

  filter();
}

function filter(){
  const q=search.value.toLowerCase().trim();
  if(!q){results.innerHTML="";return;}

  const found=market.filter(c=>{
    const n=names[c.id]||[c.name,c.symbol];
    return `${n[0]} ${n[1]} ${c.symbol}`.toLowerCase().includes(q);
  });

  results.innerHTML=found.length?found.map(c=>{
    const n=names[c.id]||[c.name,c.symbol];
    const change=Number(c.price_change_percentage_24h||0);
    return `<div class="result">
      <div><b>${n[0]}</b><small>${n[1]}/USD</small></div>
      <b class="${change>=0?"up":"down"}">${money(c.current_price)}</b>
    </div>`;
  }).join(""):'<div class="message">No matching asset.</div>';
}

async function load(){
  refresh.textContent="↻ Loading...";
  try{
    const url="https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids="+ids.join(",")+"&order=market_cap_desc&per_page=8&page=1&sparkline=false&price_change_percentage=24h";
    const response=await fetch(url);
    if(!response.ok) throw new Error("API error");
    market=await response.json();
    render();
  }catch(error){
    coins.innerHTML='<div class="message">Market data is temporarily unavailable. Tap Refresh to try again.</div>';
  }finally{
    refresh.textContent="↻ Refresh";
  }
}

search.addEventListener("input",filter);
refresh.addEventListener("click",load);
load();
