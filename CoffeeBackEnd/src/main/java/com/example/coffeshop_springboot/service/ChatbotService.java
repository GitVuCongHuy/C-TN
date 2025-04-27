package com.example.coffeshop_springboot.service;

import com.google.api.gax.core.FixedCredentialsProvider;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.auth.oauth2.ServiceAccountCredentials;
import com.google.cloud.dialogflow.v2.*; // Import các class của Dialogflow v2 (ES)
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.UUID;

@Service
public class ChatbotService {

    private static final Logger log = LoggerFactory.getLogger(ChatbotService.class);

    // Lấy Project ID từ application.properties hoặc biến môi trường
    @Value("${dialogflow.project-id}")
    private String projectId;

    // Lấy đường dẫn file credentials từ application.properties
    @Value("${dialogflow.credentials.path:dialogflow-credentials.json}") // Mặc định là tên file trong resources
    private String credentialsPath;

    private SessionsClient sessionsClient;
    private SessionName sessionName; // Sẽ được tạo cho mỗi phiên hội thoại

    // Khởi tạo client khi service được tạo (nên dùng @PostConstruct)
    @jakarta.annotation.PostConstruct // Hoặc javax.annotation.PostConstruct tùy phiên bản
    private void initializeDialogflowClient() throws IOException {
        log.info("Initializing Dialogflow client...");
        InputStream credentialsStream = new ClassPathResource(credentialsPath).getInputStream();
        GoogleCredentials credentials = GoogleCredentials.fromStream(credentialsStream);
        // Nếu credentials là ServiceAccountCredentials, có thể lấy projectId từ nó
        if (credentials instanceof ServiceAccountCredentials && (projectId == null || projectId.isEmpty())) {
            projectId = ((ServiceAccountCredentials) credentials).getProjectId();
            log.warn("Dialogflow project ID not set in properties, using ID from credentials: {}", projectId);
        }
        if (projectId == null || projectId.isEmpty()) {
            log.error("Dialogflow Project ID is missing. Please set dialogflow.project-id in application properties.");
            throw new IllegalStateException("Dialogflow Project ID is missing.");
        }

        SessionsSettings sessionsSettings = SessionsSettings.newBuilder()
                .setCredentialsProvider(FixedCredentialsProvider.create(credentials))
                .build();
        this.sessionsClient = SessionsClient.create(sessionsSettings);
        log.info("Dialogflow client initialized successfully for project: {}", projectId);
    }

    public String detectIntent(String text, String sessionId) {
        if (sessionsClient == null) {
            log.error("Dialogflow SessionsClient is not initialized.");
            return "Error: Chatbot client not ready.";
        }
        if (sessionId == null || sessionId.isEmpty()) {
            sessionId = UUID.randomUUID().toString(); // Tạo sessionId mới nếu chưa có
            log.warn("No sessionId provided, generated new one: {}", sessionId);
        }

        // Tạo SessionName: projects/<Project ID>/agent/sessions/<Session ID>
        SessionName currentSession = SessionName.of(projectId, sessionId);
        log.debug("Sending text '{}' to Dialogflow session: {}", text, currentSession.toString());


        // Tạo query input
        TextInput.Builder textInput = TextInput.newBuilder().setText(text).setLanguageCode("vi-VN"); // Đặt đúng mã ngôn ngữ agent của bạn (ví dụ: vi-VN, en-US)
        QueryInput queryInput = QueryInput.newBuilder().setText(textInput).build();

        try {
            // Gọi API detectIntent
            DetectIntentRequest request = DetectIntentRequest.newBuilder()
                    .setSession(currentSession.toString())
                    .setQueryInput(queryInput)
                    .build();
            DetectIntentResponse response = sessionsClient.detectIntent(request);

            QueryResult queryResult = response.getQueryResult();
            String fulfillmentText = queryResult.getFulfillmentText();

            log.debug("Dialogflow detected intent: {}", queryResult.getIntent().getDisplayName());
            log.debug("Dialogflow fulfillment text: {}", fulfillmentText);

            if (fulfillmentText != null && !fulfillmentText.isEmpty()) {
                return fulfillmentText; // Trả về câu trả lời từ Dialogflow
            } else {
                log.warn("Dialogflow returned empty fulfillment text for query: {}", text);
                return "Xin lỗi, tôi chưa hiểu ý bạn lắm. Bạn có thể nói rõ hơn không?"; // Câu trả lời mặc định nếu Dialogflow không có response
            }
        } catch (Exception e) {
            log.error("Error calling Dialogflow detectIntent API for session {}: {}", currentSession, e.getMessage(), e);
            return "Xin lỗi, đã có lỗi xảy ra khi kết nối đến chatbot.";
        }
    }

    // Đảm bảo đóng client khi ứng dụng dừng (quan trọng)
    @jakarta.annotation.PreDestroy // Hoặc javax.annotation.PreDestroy
    public void cleanup() {
        if (sessionsClient != null) {
            log.info("Closing Dialogflow SessionsClient...");
            sessionsClient.close();
            log.info("Dialogflow SessionsClient closed.");
        }
    }
}