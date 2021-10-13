function registerSpeedDeal(helpPaneId, smartotekaFabric) {
    function toHelp(step, keyMapper = (k) => k, delim = ",") {
        return Object
            .keys(step)
            .map(keyMapper)
            .join(delim)
    }

    let actions = {
        session: {
            o: {
                desciption: "Open in current window",
                action: openTabs
            },
            n: {
                desciption: "Open in new window",
                action: openTabsInNewWindow
            },
            c: {
                desciption: "Close tabs and dublicates",
                action: closeTabsByUrlIfOpen
            }
        },
        cheatsheets: {
            g: {
                desciption: "Go to cheat sheets",
                action: () => redirectCurrentTab("../cheatsheets/cheatsheet.html")
            }
        }
    };


    smartotekaFabric.queriesProvider().getSpeedDeal()
        .then(speedDealShortCut => {

            let firstHelp = toHelp(speedDealShortCut);

            if (firstHelp)
                $(".values", helpPaneId).text(firstHelp + " for spead deal during two seconds");

            let pointer = speedDealShortCut;

            let handler = () => { };
            let keyDownHandler = () => { };

            function speedDealKeyPress(e) {
                if (document.activeElement.nodeName !== "BODY")
                    return;

                let nextStep = pointer[e.key.toLowerCase()];

                if (!nextStep)//TODO: e.key - letter. hot key not work in russian. Let think about keyCode
                    return;

                console.log(e.key + ": " + toHelp(nextStep));

                pointer = nextStep;

                if (typeof (pointer) === "object" && !nextStep.action) {
                    setTimeout(() => {
                        $(".values", helpPaneId).html("<br>" + toHelp(pointer, (k) => k + "&nbsp;-&nbsp;" + pointer[k].desciption, "<br>"));
                    }, 0);
                }


                if (!nextStep.type) {

                    if (nextStep.action) {
                        console.log("Set operation" + new Date())
                        handler = nextStep.action;

                        keyDownHandler();
                        setTimeout(() => {
                            $(".values", helpPaneId).text(nextStep.desciption);
                            $(helpPaneId).text("You choosed:")
                        }, 0);
                    }

                    return;
                }

                pointer = actions[nextStep.type];

                setTimeout(() => {
                    $(".values", helpPaneId).html("<br>" + toHelp(pointer, (k) => k + "&nbsp;-&nbsp;" + pointer[k].desciption, "<br>"));
                }, 0);

                handler = pointer[nextStep.action].action;
                let mainHandler = () => { };

                switch (nextStep.type) {

                    case "session":
                        let id = parseInt(nextStep.id);

                        mainHandler = () => {
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
                        }
                        break;
                    case "cheatsheets":
                        mainHandler = () => handler();
                        break;
                    default:
                        throw new Error("Unexpected type '" + nextStep.type + "'")
                        break;
                }

                keyDownHandler = secondRunImmediately(mainHandler, 1500);
                keyDownHandler();
            }


            $(document).bind("keypress.speedDeal", speedDealKeyPress);

            setTimeout(() => {
                $(document).unbind("keypress.speedDeal");
                $(helpPaneId).hide();
            }, 3000);
        });
}