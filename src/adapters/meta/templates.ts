import axios from "axios";

const TOKEN_META = process.env.TOKEN_META;
const ID_WABA = process.env.ID_WABA;
const VERSAO_META = process.env.VERSAO_META;

export const getTemplates = async (idWaba: string) => {
    try {
        const url = `https://graph.facebook.com/${VERSAO_META}/${idWaba ?? ID_WABA}/message_templates`
        const { data, status } = await axios.get(
            url,
            {
                headers: {
                    "Authorization": `Bearer ${TOKEN_META}`,
                    "Content-Type": "application/json"
                }
            }
        )

        return {
            status,
            templates: data?.data || [],
            message: "Sucesso ao coletar dados"
        }
    } catch (e: any) {
        return {
            status: e.response?.status || 500,
            templates: [],
            message: e.response?.data || e.message
        }
    }
}

const mock = {
    "data": [
        {
            "name": "hello_world",
            "previous_category": "ACCOUNT_UPDATE",
            "components": [
                {
                    "type": "HEADER",
                    "format": "TEXT",
                    "text": "Hello World"
                },
                {
                    "type": "BODY",
                    "text": "Welcome and congratulations!! This message demonstrates your ability to send a message notification from WhatsApp Business Platform’s Cloud API. Thank you for taking the time to test with us."
                },
                {
                    "type": "FOOTER",
                    "text": "WhatsApp Business API Team"
                }
            ],
            "language": "en_US",
            "status": "APPROVED",
            "category": "MARKETING",
            "id": "1192339204654487"
        },
        {
            "name": "2023_april_promo",
            "components": [
                {
                    "type": "HEADER",
                    "format": "TEXT",
                    "text": "Fall Sale"
                },
                {
                    "type": "BODY",
                    "text": "Hi {{1}}, our Fall Sale is on! Use promo code {{2}} Get an extra 25% off every order above $350!",
                    "example": {
                        "body_text": [
                            [
                                "Mark",
                                "FALL25"
                            ]
                        ]
                    }
                },
                {
                    "type": "FOOTER",
                    "text": "Not interested in any of our sales? Tap Stop Promotions"
                },
                {
                    "type": "BUTTONS",
                    "buttons": [
                        {
                            "type": "QUICK_REPLY",
                            "text": "Stop promotions"
                        }
                    ]
                }
            ],
            "language": "en_US",
            "status": "APPROVED",
            "category": "MARKETING",
            "id": "920070352646140"
        }
    ],
    "paging": {
        "cursors": {
            "before": "MAZDZD",
            "after": "MjQZD"
        }
    }
}