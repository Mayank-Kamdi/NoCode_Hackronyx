import datetime

class AIRiskEngine:
    """
    ABHAYA Dynamic Threat Scoring Engine
    Calculates dynamic threat risk scores (0 to 100) based on contextual computer vision features:
    - Isolation score (Distance to crowd/bystanders)
    - Proximity Encroachment (Rapid narrowing gap between target and trailing individual)
    - Motion Trajectory Co-alignment (Pursuit/following vector)
    - Distress Gesture (Raised arms, rapid stance shift)
    - Time-of-Day factor (Nighttime booster 22:00 - 05:00)
    """

    @staticmethod
    def calculate_risk(
        isolation_score: float,       # 0.0 - 1.0
        proximity_encroachment: float, # 0.0 - 1.0
        pursuit_vector_coalignment: float, # 0.0 - 1.0
        distress_gesture: float,       # 0.0 - 1.0
        is_nighttime: bool = True,
        hotspot_modifier: float = 1.15
    ) -> dict:
        
        # Base weights
        w_isolation = 30.0
        w_proximity = 25.0
        w_pursuit = 25.0
        w_distress = 35.0

        raw_score = (
            (isolation_score * w_isolation) +
            (proximity_encroachment * w_proximity) +
            (pursuit_vector_coalignment * w_pursuit) +
            (distress_gesture * w_distress)
        )

        if is_nighttime:
            raw_score *= 1.25 # 25% nighttime risk multiplier

        raw_score *= hotspot_modifier

        final_score = min(100.0, max(0.0, round(raw_score, 1)))

        # Categorize threat level
        if final_score >= 80:
            threat_level = "CRITICAL"
        elif final_score >= 60:
            threat_level = "HIGH"
        elif final_score >= 35:
            threat_level = "MEDIUM"
        else:
            threat_level = "LOW"

        # Generate descriptive factor list
        factors = []
        if isolation_score > 0.6:
            factors.append("Isolated Woman Detected (>15m from nearest bystander)")
        if proximity_encroachment > 0.5:
            factors.append("Rapid Unsanctioned Proximity Encroachment (<1.5m distance)")
        if pursuit_vector_coalignment > 0.6:
            factors.append("Co-aligned Directional Pursuit Motion Vector")
        if distress_gesture > 0.5:
            factors.append("Distress Posture Identified (Hands Up / Rapid Stance Shift)")
        if is_nighttime:
            factors.append("High-Risk Time Window (22:00 - 05:00)")
        
        if not factors:
            factors.append("Normal Motion - Low Density Public Foot Traffic")

        return {
            "risk_score": final_score,
            "threat_level": threat_level,
            "detected_factors": factors,
            "metrics": {
                "isolation": round(isolation_score * 100, 1),
                "proximity": round(proximity_encroachment * 100, 1),
                "pursuit": round(pursuit_vector_coalignment * 100, 1),
                "distress": round(distress_gesture * 100, 1)
            }
        }

risk_engine = AIRiskEngine()
