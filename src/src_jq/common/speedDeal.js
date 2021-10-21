function getActions() {
    if (!window.actions)
        window.actions = {
            session: [
                {
                    key: "o",
                    type: "changeHandler",
                    description: "Open in current window",
                    action: openTabs
                },
                {
                    key: "n",
                    type: "changeHandler",
                    description: "Open in new window",
                    action: openTabsInNewWindow
                },
                {
                    key: "c",
                    type: "changeHandler",
                    description: "Close tabs and dublicates",
                    action: closeTabsByUrlIfOpen
                }
            ],
            // cheatsheets: {
            //     g: {
            //         description: "Go to cheat sheets",
            //         action: () => redirectCurrentTab("../cheatsheets/cheatsheet.html")
            //     }
            // }
        };

    return window.actions;
}

function toHelp(steps, keyMapper = (k) => k, delim = ",") {
    return steps
        .map(keyMapper)
        .join(delim)
}

function setSpeedDealHelp(helpPaneId, step) {
    setTimeout(() => {
        $(".values", helpPaneId)
            .html("<br>" + toHelp(
                step,
                (el) => "<li action='" + el.key + "'>" + el.key + "&nbsp;-&nbsp;" + el.description + "</li>", ""));

        $('.values li', helpPaneId).click(function () {
            let action = $(this).attr('action');

            speedDealKeyPress({ key: action });
        });
    }, 0);
}
function registerSpeedDeal(helpPaneId, smartotekaFabric) {

    if ($(helpPaneId).is(":visible"))
        return;

    $(helpPaneId).show();

    $(helpPaneId).html(`You can press
        <span class="values" style="color: green">hot key after configure it on settings page</span>`);

    let actions = getActions();

    smartotekaFabric.queriesProvider().getSpeedDeal()
        .then(speedDealShortCut => {

            let firstHelp = toHelp(speedDealShortCut);
            let pointer = speedDealShortCut;

            if (firstHelp) {
                setSpeedDealHelp(helpPaneId, pointer);
            }

            let handler = () => { };
            let keyDownHandler = () => { };

            function speedDealKeyPress(e) {
                if (document.activeElement.nodeName !== "BODY")
                    return;

                let index = pointer.findIndex(el => el.key === e.key.toLowerCase());
                let nextStep = index < 0 ? null : pointer[index];

                if (!nextStep)//TODO: e.key - letter. hot key not work in russian. Let think about keyCode
                    return;

                removeSpeaDealHandlers();
                $(helpPaneId).html("You choosed: " + e.key + "<span class='values'/>")

                console.log(e.key + " " + JSON.stringify(nextStep));

                switch (nextStep.type) {
                    case "choice":
                        {
                            pointer = nextStep.items;
                            setSpeedDealHelp(helpPaneId, pointer);
                            break;
                        }
                    case "changeHandler":
                        {
                            handler = nextStep.action;
                            break;
                        }
                    case "cheatsheets":
                        {
                            break;
                        }
                    case "session":
                        {
                            let index = actions.session.findIndex(el => el.key === nextStep.action);
                            if (index < 0)
                                throw new Error("Unexpected action " + nextStep.action);

                            handler = actions.session[index].action;
                            let id = parseInt(nextStep.id);

                            let mainHandler = () => {
                                smartotekaFabric.queriesProvider()
                                    .getSession(id)
                                    .then(session => {

                                        if (session) {
                                            console.log("Run operation" + new Date())
                                            handler(session.tabs);
                                        }
                                        else {
                                            alert("session not found!")
                                        }

                                        $(document).unbind("keypress.speedDeal");
                                        $(helpPaneId).hide();
                                    });
                            };

                            keyDownHandler = secondRunImmediately(mainHandler, 1500);
                            keyDownHandler();

                            pointer = actions.session;
                            setSpeedDealHelp(helpPaneId, pointer);

                            break;
                        }
                    default:
                        throw new Error("Unexpeced type of speed deal " + nextStep.type)
                }
            }


            $(document).bind("keypress.speedDeal", speedDealKeyPress);

            var removeSpeaDealHandlers = throttle(
                () => {
                    $(document).unbind("keypress.speedDeal");
                    $(helpPaneId).hide();
                }, 5000);

            removeSpeaDealHandlers();
        });

}

window.getActions = getActions;
window.registerSpeedDeal = registerSpeedDeal;