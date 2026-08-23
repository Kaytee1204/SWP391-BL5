package com.example.base.dto.payment;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class SePayWebhookPayload {

    private Long id;
    private String gateway;

    @JsonAlias({"transaction_date", "transactionDate"})
    private String transactionDate;

    @JsonAlias({"account_number", "accountNumber"})
    private String accountNumber;

    @JsonAlias({"sub_account", "subAccount"})
    private String subAccount;

    @JsonAlias({"amount_in", "amountIn", "transferAmount", "transfer_amount"})
    private Double amountIn;

    @JsonAlias({"amount_out", "amountOut"})
    private Double amountOut;

    private Double accumulated;
    private String code;

    @JsonAlias({"transaction_content", "transactionContent", "content"})
    private String transactionContent;

    @JsonAlias({"reference_number", "referenceNumber", "referenceCode", "reference_code"})
    private String referenceNumber;

    private String body;
    private String description;
}
