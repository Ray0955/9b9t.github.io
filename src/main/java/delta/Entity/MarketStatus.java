package delta.Entity;

public class MarketStatus {
    public boolean work = true;
    public MarketStatus() {}
    public MarketStatus(boolean work) {
        this.work = work;
    }
    public void setWork(boolean work) {
        this.work = work;
    }
    public boolean isWork() {
        return work;
    }
}
