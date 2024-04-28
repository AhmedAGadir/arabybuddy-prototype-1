import React from "react";

const ConversationPage = ({
	params,
}: {
	params: { conversationId: string };
}) => {
	return <div>ConversationPage: {params.conversationId}</div>;
};

export default ConversationPage;
