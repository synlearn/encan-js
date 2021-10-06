import Config from "./config";
import GlobalEvent from "./globalEvent";
import Logger from "./logger";
import Job from "./job";
import HttpAction from "./httpAction";


const Register = {
    registerServer: function (_register_data) {
        Logger.log("registerServer ");
        const server_url = Config.userConfig['server'];
        return HttpAction.post(server_url, _register_data)
    },
    isRealUserAgent: function () {
        const isBotA = /bot|googlebot|crawler|spider|robot|crawling/i.test(navigator.userAgent);
        if (isBotA) return false;
        let botPattern = "(googlebot\/|bot|Googlebot-Mobile|Googlebot-Image|Google favicon|Mediapartners-Google|bingbot|slurp|java|wget|curl|Commons-HttpClient|Python-urllib|libwww|httpunit|nutch|phpcrawl|msnbot|jyxobot|FAST-WebCrawler|FAST Enterprise Crawler|biglotron|teoma|convera|seekbot|gigablast|exabot|ngbot|ia_archiver|GingerCrawler|webmon |httrack|webcrawler|grub.org|UsineNouvelleCrawler|antibot|netresearchserver|speedy|fluffy|bibnum.bnf|findlink|msrbot|panscient|yacybot|AISearchBot|IOI|ips-agent|tagoobot|MJ12bot|dotbot|woriobot|yanga|buzzbot|mlbot|yandexbot|purebot|Linguee Bot|Voyager|CyberPatrol|voilabot|baiduspider|citeseerxbot|spbot|twengabot|postrank|turnitinbot|scribdbot|page2rss|sitebot|linkdex|Adidxbot|blekkobot|ezooms|dotbot|Mail.RU_Bot|discobot|heritrix|findthatfile|europarchive.org|NerdByNature.Bot|sistrix crawler|ahrefsbot|Aboundex|domaincrawler|wbsearchbot|summify|ccbot|edisterbot|seznambot|ec2linkfinder|gslfbot|aihitbot|intelium_bot|facebookexternalhit|yeti|RetrevoPageAnalyzer|lb-spider|sogou|lssbot|careerbot|wotbox|wocbot|ichiro|DuckDuckBot|lssrocketcrawler|drupact|webcompanycrawler|acoonbot|openindexspider|gnam gnam spider|web-archive-net.com.bot|backlinkcrawler|coccoc|integromedb|content crawler spider|toplistbot|seokicks-robot|it2media-domain-crawler|ip-web-crawler.com|siteexplorer.info|elisabot|proximic|changedetection|blexbot|arabot|WeSEE:Search|niki-bot|CrystalSemanticsBot|rogerbot|360Spider|psbot|InterfaxScanBot|Lipperhey SEO Service|CC Metadata Scaper|g00g1e.net|GrapeshotCrawler|urlappendbot|brainobot|fr-crawler|binlar|SimpleCrawler|Livelapbot|Twitterbot|cXensebot|smtbot|bnf.fr_bot|A6-Indexer|ADmantX|Facebot|Twitterbot|OrangeBot|memorybot|AdvBot|MegaIndex|SemanticScholarBot|ltx71|nerdybot|xovibot|BUbiNG|Qwantify|archive.org_bot|Applebot|TweetmemeBot|crawler4j|findxbot|SemrushBot|yoozBot|lipperhey|y!j-asr|Domain Re-Animator Bot|AddThis)";
        let re = new RegExp(botPattern, 'i');
        let userAgent = navigator.userAgent;
        return !re.test(userAgent);

    },
    enqueueRegisterJob: function () {
       return   Job.submitRegisterJob(Register.registerServer);
    },
    register: function (config) {
        Config.userConfig = {...Config.userConfig, ...config};
        Logger.log("Register Called ",   Config.userConfig);

        let _navigator = {};
        let _document = {};
        let copyKeyNavigator = ["vendorSub", "productSub", "vendor", "doNotTrack", "connection",
            "cookieEnabled", "appCodeName", "appName", "appVersion", "platform",
            "product", "userAgent", "deviceMemory", "userAgentData", "mobile"];
        let copyKeyDocument = ['activeElement', 'location', 'title', 'URL'];

        for (let i in window.navigator) {
            if (copyKeyNavigator.indexOf(i) !== -1 && navigator[i])
                _navigator[i] = navigator[i];
        }

        for (let i in window.document) {
            if (copyKeyDocument.indexOf(i) !== -1 && window.document[i])
                _document[i] = window.document[i];
        }


        Logger.log(JSON.stringify(_navigator));
        Logger.log(JSON.stringify(_document));

        let _register_data = {_navigator, _document,};

        let _existingMapper = (document.onclick);
        document.onclick = function (event) {
            //call already allocated method if any
            if (_existingMapper)
                _existingMapper.call(this);

            //only register if user performs any action
            //skip any bot actions
            if (!Register.isRealUserAgent)
                return;
            if (!Config.registered) {
                Register.registerServer(_register_data).then(function (registered) {
                    Config.registered = registered;
                }).catch(function () {
                    Register.enqueueRegisterJob();
                });
            }
            // Compensate for IE<9's non-standard event model
            if (event === undefined) event = window.event;
            let target = 'target' in event ? event.target : event.srcElement;
            if (target && (Config.userConfig['track_all'] || (target.classList && target.classList.contains(Config.userConfig.click_track_class)))) {
                Logger.log('clicked on ' + target.tagName, target);
                GlobalEvent.fireEvent('click', target)
            }
        };
    }
};
export default Register.register