FROM sebp/elk:latest

# Copy the custom Logstash configuration file into the container
COPY logstash.conf /etc/logstash/conf.d/logstash.conf

EXPOSE 5044 9200 5601
