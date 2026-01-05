// Runtime config
const _p=["enZrb3","VsaHpp","a3NmeG","54a2ty","bWI="];
const _s=["ZXlKaG","JHY2lP","aUpJVX","pJMU5p","SXNJbl","I1Y0NJ","NklrcF","hWQ0o5","LmV5Sn","BjM01p","T2lKem","RYQmhZ","bUZ6Wl","NJc0lu","SmxaaU","k2SW5w","MmEyOT","FiR2g2","YVd0el","puaHVl","R3RyY2","0xaUlp","d2ljbT","lzWlNJ","NkltRn","ViMjRp","TENKcF","lYUWlP","akUzTm","pRME1U","RTNOal","FzSW1W","NGNDST","ZNakEz","T1RrNE","56YzJO","SDAuR0","o4Mlpw","MzdEWE","lDVkR2","aG1qU0","dvNlRI","U21ZY1","N1eWtS","VmdOM3","o0V1dX","MA=="];
function _d(a:string[]):string{try{return atob(a.join(""))}catch{return Buffer.from(a.join(""),"base64").toString("utf-8")}}
export const getSupabaseUrl=():string=>"https://"+_d(_p)+".supabase.co";
export const getSupabaseAnonKey=():string=>_d(_s);
export const getEdgeFunctionUrl=(fn:string):string=>getSupabaseUrl()+"/functions/v1/"+fn;
